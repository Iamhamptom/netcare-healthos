/**
 * VeriClaim Integration Adapter
 *
 * VeriClaim (by MediCharge) has NO public API.
 * Stack: C#/.NET 4.0, ASP.NET MVC 5.2, AngularJS 1.x, SQL Server 14TB, IIS 10
 *
 * This adapter provides 3 integration methods:
 *
 * METHOD 1: Email Sync (Zero permission needed)
 *   - VeriClaim sends appointment confirmations/reminders via email
 *   - We parse these emails to understand diary state
 *   - Buhle forwards VeriClaim notifications to our parsing inbox
 *
 * METHOD 2: Calendar Bridge (Minimal permission)
 *   - VeriClaim's mobile app (Xamarin/MAUI) likely syncs with a calendar
 *   - We read the shared calendar (Google/Outlook) that VeriClaim writes to
 *   - Two-way: we write bookings to the calendar, VeriClaim reads them
 *
 * METHOD 3: Agentic Browser Automation (With credentials)
 *   - RPA-style agent that logs into VeriClaim web portal
 *   - Reads diary, creates bookings, checks availability
 *   - Requires RheumCare to share VeriClaim login (their own credentials)
 *
 * In all methods, the flow is:
 * Patient → WhatsApp AI → Checks availability (via adapter) → Books → Confirms
 */

// ═══════════════════════════════════════════════════════
// METHOD 1: EMAIL SYNC
// ═══════════════════════════════════════════════════════

export interface VeriClaimEmailEvent {
  type: "appointment_created" | "appointment_cancelled" | "appointment_modified" | "reminder_sent" | "claim_submitted" | "payment_received";
  raw: string;
  parsed: {
    patientName?: string;
    patientPhone?: string;
    doctorName?: string;
    date?: string;
    time?: string;
    location?: string;
    service?: string;
    status?: string;
    claimRef?: string;
    amount?: number;
  };
  parsedAt: string;
}

/**
 * Parse a VeriClaim notification email into structured data.
 * VeriClaim sends automated emails for appointments, claims, and payments.
 * This parser extracts key fields using pattern matching.
 */
export function parseVeriClaimEmail(subject: string, body: string, from: string): VeriClaimEmailEvent | null {
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();

  // Determine event type from subject/body patterns
  let type: VeriClaimEmailEvent["type"] = "appointment_created";
  if (lowerSubject.includes("cancel") || lowerBody.includes("cancelled")) type = "appointment_cancelled";
  else if (lowerSubject.includes("reschedule") || lowerSubject.includes("modified") || lowerSubject.includes("changed")) type = "appointment_modified";
  else if (lowerSubject.includes("reminder")) type = "reminder_sent";
  else if (lowerSubject.includes("claim") || lowerBody.includes("claim submitted")) type = "claim_submitted";
  else if (lowerSubject.includes("payment") || lowerSubject.includes("receipt")) type = "payment_received";

  // Extract fields using common medical email patterns
  const parsed: VeriClaimEmailEvent["parsed"] = {};

  // Patient name — look for "Patient: ", "Dear ", "Mr/Mrs/Dr "
  const nameMatch = body.match(/(?:Patient|Name|Dear|Mr|Mrs|Ms|Dr)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (nameMatch) parsed.patientName = nameMatch[1];

  // Phone
  const phoneMatch = body.match(/(?:Phone|Tel|Cell|Mobile)[:\s]+([\d\s+()-]{10,})/i);
  if (phoneMatch) parsed.patientPhone = phoneMatch[1].trim();

  // Date — look for DD/MM/YYYY, YYYY-MM-DD, or "March 26, 2026" formats
  const dateMatch = body.match(/(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/);
  if (dateMatch) parsed.date = dateMatch[1];
  else {
    const longDateMatch = body.match(/(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i);
    if (longDateMatch) parsed.date = longDateMatch[1];
  }

  // Time
  const timeMatch = body.match(/(\d{1,2}[:h]\d{2}(?:\s*(?:AM|PM))?)/i);
  if (timeMatch) parsed.time = timeMatch[1];

  // Doctor
  const doctorMatch = body.match(/(?:Doctor|Dr|Practitioner)[:\s.]+([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (doctorMatch) parsed.doctorName = doctorMatch[1];

  // Location
  const locationMatch = body.match(/(?:Location|Venue|Practice|Hospital)[:\s]+(.+?)(?:\n|$)/i);
  if (locationMatch) parsed.location = locationMatch[1].trim();

  // Amount
  const amountMatch = body.match(/R\s*([\d,]+(?:\.\d{2})?)/);
  if (amountMatch) parsed.amount = parseFloat(amountMatch[1].replace(",", ""));

  // Service
  const serviceMatch = body.match(/(?:Service|Procedure|Consultation|Type)[:\s]+(.+?)(?:\n|$)/i);
  if (serviceMatch) parsed.service = serviceMatch[1].trim();

  return {
    type,
    raw: body.substring(0, 2000),
    parsed,
    parsedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════
// METHOD 2: CALENDAR BRIDGE
// ═══════════════════════════════════════════════════════

export interface CalendarSlot {
  date: string;         // YYYY-MM-DD
  time: string;         // HH:MM
  duration: number;     // minutes
  available: boolean;
  location: string;
  doctor: string;
  source: "vericlaim_sync" | "manual" | "whatsapp_booking";
}

/**
 * Calendar bridge configuration.
 * RheumCare shares a Google Calendar or Outlook Calendar with us.
 * VeriClaim's mobile app can sync with these calendars.
 * We read availability and write new bookings.
 */
export interface CalendarBridgeConfig {
  provider: "google" | "outlook" | "ical";
  calendarId?: string;
  // Google
  googleServiceAccountEmail?: string;
  // Outlook
  outlookClientId?: string;
  // iCal (read-only)
  icalUrl?: string;
  // Sync settings
  syncIntervalMinutes: number;
  defaultSlotDuration: number;
  workingHours: { start: string; end: string };
  locations: Array<{ id: string; name: string; calendarId: string }>;
}

/**
 * Parse an iCal feed to extract availability slots.
 * Many practice management systems (including VeriClaim's mobile app)
 * can export calendars as iCal (.ics) feeds.
 */
export function parseICalFeed(icalData: string): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const events = icalData.split("BEGIN:VEVENT");

  for (const event of events.slice(1)) {
    const dtstart = event.match(/DTSTART[^:]*:(\d{8}T\d{6})/);
    const dtend = event.match(/DTEND[^:]*:(\d{8}T\d{6})/);
    const summary = event.match(/SUMMARY[^:]*:(.+)/);
    const location = event.match(/LOCATION[^:]*:(.+)/);

    if (dtstart) {
      const start = dtstart[1];
      const date = `${start.substring(0, 4)}-${start.substring(4, 6)}-${start.substring(6, 8)}`;
      const time = `${start.substring(9, 11)}:${start.substring(11, 13)}`;

      let duration = 30; // default
      if (dtend) {
        const endTime = dtend[1];
        const startMin = parseInt(start.substring(9, 11)) * 60 + parseInt(start.substring(11, 13));
        const endMin = parseInt(endTime.substring(9, 11)) * 60 + parseInt(endTime.substring(11, 13));
        duration = endMin - startMin;
      }

      const summaryText = summary?.[1]?.trim() || "";
      // Events with "AVAILABLE", "OPEN", or no title = available slots
      // Events with patient names or "BOOKED" = unavailable
      const isBooked = /booked|patient|consultation|follow-?up/i.test(summaryText) && !/available|open|free/i.test(summaryText);

      slots.push({
        date,
        time,
        duration,
        available: !isBooked,
        location: location?.[1]?.trim() || "Unknown",
        doctor: "Dr. Joyce Ziki",
        source: "vericlaim_sync",
      });
    }
  }

  return slots;
}

/**
 * Generate available slots for a given date range.
 * Uses calendar data to find gaps where new bookings can be made.
 */
export function findAvailableSlots(
  bookedSlots: CalendarSlot[],
  dateRange: { from: string; to: string },
  config: {
    workingStart: string;  // "08:30"
    workingEnd: string;    // "17:00"
    slotDuration: number;  // 30 minutes
    location: string;
  }
): CalendarSlot[] {
  const available: CalendarSlot[] = [];
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Get booked slots for this date
    const dayBookings = bookedSlots
      .filter(s => s.date === dateStr && s.location === config.location)
      .map(s => {
        const [h, m] = s.time.split(":").map(Number);
        return { start: h * 60 + m, end: h * 60 + m + s.duration };
      })
      .sort((a, b) => a.start - b.start);

    // Generate all possible slots
    const [startH, startM] = config.workingStart.split(":").map(Number);
    const [endH, endM] = config.workingEnd.split(":").map(Number);
    const dayStart = startH * 60 + startM;
    const dayEnd = endH * 60 + endM;

    for (let t = dayStart; t + config.slotDuration <= dayEnd; t += config.slotDuration) {
      const slotEnd = t + config.slotDuration;
      const isBooked = dayBookings.some(b => t < b.end && slotEnd > b.start);

      if (!isBooked) {
        const hours = Math.floor(t / 60).toString().padStart(2, "0");
        const mins = (t % 60).toString().padStart(2, "0");
        available.push({
          date: dateStr,
          time: `${hours}:${mins}`,
          duration: config.slotDuration,
          available: true,
          location: config.location,
          doctor: "Dr. Joyce Ziki",
          source: "vericlaim_sync",
        });
      }
    }
  }

  return available;
}

// ═══════════════════════════════════════════════════════
// METHOD 3: AGENTIC BROWSER AUTOMATION (RPA)
// ═══════════════════════════════════════════════════════

/**
 * VeriClaim Browser Agent Actions.
 * These represent the actions the RPA agent can perform on VeriClaim's web portal.
 * The agent logs in, navigates the ASP.NET MVC pages, and performs actions.
 *
 * Since VeriClaim uses AngularJS 1.x, the DOM is relatively predictable.
 * ASP.NET MVC generates server-rendered HTML with AngularJS bindings.
 */
export interface VeriClaimAgentConfig {
  loginUrl: string;      // https://www.vericlaim.co.za (or practice-specific subdomain)
  username: string;       // RheumCare's VeriClaim username
  password: string;       // RheumCare's VeriClaim password
  practiceId: string;     // VeriClaim practice identifier
}

export interface VeriClaimAction {
  action: "check_diary" | "create_appointment" | "cancel_appointment" | "get_patient" | "search_patient";
  params: Record<string, string>;
}

export interface VeriClaimDiaryEntry {
  date: string;
  time: string;
  patientName: string;
  patientPhone?: string;
  service: string;
  doctor: string;
  status: "confirmed" | "tentative" | "cancelled" | "completed";
  location: string;
}

/**
 * Generate browser automation instructions for VeriClaim.
 * These can be executed by Playwright, Puppeteer, or our agentic browser.
 *
 * VeriClaim's web structure (ASP.NET MVC + AngularJS):
 * - Login: POST to /Account/Login with __RequestVerificationToken
 * - Diary: /Diary/Index or /Diary/Day?date=YYYY-MM-DD
 * - Patient search: /Patient/Search?term=XXX
 * - New appointment: /Diary/CreateAppointment (modal/form)
 */
export function generateBrowserScript(action: VeriClaimAction): string {
  switch (action.action) {
    case "check_diary":
      return `
// Check VeriClaim diary for a specific date
// 1. Navigate to diary page
await page.goto(baseUrl + '/Diary/Day?date=${action.params.date || ""}');
// 2. Wait for AngularJS to render
await page.waitForSelector('.diary-slot, .appointment-block, [ng-repeat]');
// 3. Extract all appointments
const appointments = await page.evaluate(() => {
  const items = document.querySelectorAll('.appointment-block, .diary-entry, [ng-repeat*="appointment"]');
  return Array.from(items).map(el => ({
    time: el.querySelector('.time, .appointment-time')?.textContent?.trim(),
    patient: el.querySelector('.patient-name, .patient')?.textContent?.trim(),
    service: el.querySelector('.service, .appointment-type')?.textContent?.trim(),
    doctor: el.querySelector('.doctor, .practitioner')?.textContent?.trim(),
    status: el.querySelector('.status, .appointment-status')?.textContent?.trim(),
  }));
});
return appointments;
`;

    case "create_appointment":
      return `
// Create a new appointment in VeriClaim
// 1. Navigate to diary
await page.goto(baseUrl + '/Diary/Day?date=${action.params.date || ""}');
// 2. Click "New Appointment" or empty slot
await page.click('.new-appointment-btn, .add-appointment, .diary-slot.empty');
// 3. Wait for appointment modal/form
await page.waitForSelector('#appointmentForm, .appointment-modal, [ng-controller*="appointment"]');
// 4. Fill in patient details
await page.fill('#PatientName, [ng-model="appointment.patientName"]', '${action.params.patientName || ""}');
await page.fill('#PatientPhone, [ng-model="appointment.phone"]', '${action.params.patientPhone || ""}');
// 5. Select time slot
await page.selectOption('#TimeSlot, [ng-model="appointment.time"]', '${action.params.time || ""}');
// 6. Select service type
await page.selectOption('#ServiceType, [ng-model="appointment.serviceType"]', '${action.params.service || "Consultation"}');
// 7. Submit
await page.click('#saveAppointment, .btn-save, [ng-click*="save"]');
// 8. Wait for confirmation
await page.waitForSelector('.success-message, .alert-success, .notification-success');
`;

    case "search_patient":
      return `
// Search for a patient in VeriClaim
await page.goto(baseUrl + '/Patient/Search');
await page.fill('#searchTerm, [ng-model="searchTerm"]', '${action.params.searchTerm || ""}');
await page.click('#searchBtn, .btn-search');
await page.waitForSelector('.patient-results, .search-results, [ng-repeat*="patient"]');
const patients = await page.evaluate(() => {
  const items = document.querySelectorAll('.patient-result, .search-result-item');
  return Array.from(items).map(el => ({
    name: el.querySelector('.patient-name')?.textContent?.trim(),
    id: el.querySelector('.patient-id')?.textContent?.trim(),
    phone: el.querySelector('.patient-phone')?.textContent?.trim(),
  }));
});
return patients;
`;

    default:
      return "// Unknown action";
  }
}

// ═══════════════════════════════════════════════════════
// UNIFIED INTERFACE — wraps all 3 methods
// ═══════════════════════════════════════════════════════

export type IntegrationMethod = "email_sync" | "calendar_bridge" | "browser_agent";

export interface VeriClaimIntegration {
  method: IntegrationMethod;
  status: "active" | "configuring" | "disconnected";
  lastSync?: string;
  nextSync?: string;
  capabilities: string[];
}

export function getIntegrationStatus(method: IntegrationMethod): VeriClaimIntegration {
  switch (method) {
    case "email_sync":
      return {
        method,
        status: "configuring",
        capabilities: [
          "Parse appointment confirmations",
          "Track cancellations and modifications",
          "Extract patient details from notifications",
          "Monitor claim submissions and payments",
        ],
      };
    case "calendar_bridge":
      return {
        method,
        status: "configuring",
        capabilities: [
          "Read diary availability in real-time",
          "Write new bookings to shared calendar",
          "Two-way sync between WhatsApp AI and VeriClaim",
          "Multi-location calendar support",
        ],
      };
    case "browser_agent":
      return {
        method,
        status: "configuring",
        capabilities: [
          "Full diary read/write access",
          "Patient search and lookup",
          "Appointment creation and management",
          "Automated data entry from WhatsApp bookings",
          "Real-time availability checking",
        ],
      };
  }
}

/**
 * Recommended integration approach for RheumCare:
 *
 * PHASE 1 (Tonight): Calendar Bridge
 * - Buhle shares a Google Calendar that VeriClaim's mobile app syncs to
 * - We read availability from that calendar
 * - We write new WhatsApp bookings to that calendar
 * - Buhle confirms in VeriClaim
 *
 * PHASE 2 (Week 1): Email Sync
 * - Buhle sets up email forwarding: VeriClaim notifications → our inbox
 * - We parse appointment events automatically
 * - Dashboard shows real-time diary state
 *
 * PHASE 3 (Month 1): Browser Agent (with permission)
 * - RheumCare grants us VeriClaim credentials (read-only user)
 * - Our agent logs in, reads diary, creates bookings directly
 * - Full automation: WhatsApp → AI qualification → VeriClaim booking → Confirmation
 *
 * PHASE 4 (Quarter 1): MediCharge Partnership
 * - Contact Brian Bear (Head of Dev) at MediCharge
 * - Propose formal API partnership
 * - We become VeriClaim's AI layer for all 1,500 practices
 */
