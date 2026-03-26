import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getAllSites } from "@/lib/location-router";

/**
 * Availability Share — Broadcast specialist availability to GPs & hospitals
 *
 * GET  /api/public/availability-share?practice=rheumcare → Public availability page data
 * POST /api/public/availability-share → GP submits a referral through the availability board
 *
 * Flow:
 * 1. Dr. Ziki has open slots this week
 * 2. System broadcasts availability to GP network (email, WhatsApp, portal)
 * 3. GP sees "Dr. Ziki available Thursday Pretoria" → clicks "Refer Patient"
 * 4. Patient gets pre-qualified (can they afford R2,600? Do they have a referral?)
 * 5. Patient auto-contacted via WhatsApp → booked → RheumCare gets a lead
 * 6. VRL charges per qualified lead
 */

// Mock availability data — in production this syncs with VeriClaim diary
function getAvailability(practice: string) {
  if (practice === "rheumcare") {
    const today = new Date();
    const slots = [];

    // Generate next 14 days of availability
    for (let d = 1; d <= 14; d++) {
      const date = new Date(today.getTime() + d * 86400000);
      const day = date.getDay(); // 0=Sun, 1=Mon...
      const dateStr = date.toISOString().split("T")[0];
      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];

      // Parktown (DGMC) — Mon-Fri
      if (day >= 1 && day <= 5) {
        slots.push({
          id: `dgmc-${dateStr}`,
          date: dateStr, day: dayName,
          site: "Wits Donald Gordon Medical Centre",
          city: "Parktown, Johannesburg",
          doctor: "Dr. Joyce Ziki",
          speciality: "Rheumatologist",
          qualifications: "MBChB, FCP(SA), MMed, Cert Rheum(SA)",
          services: ["New Consultation (R2,600)", "Follow-up (R1,400)", "Joint Injection", "Ultrasound", "Biologic Infusion"],
          slotsAvailable: Math.floor(Math.random() * 3) + 1,
          times: generateTimes(day),
          acceptsCash: true,
          acceptsMedicalAid: true,
          waitTimeDays: 3,
        });
      }

      // Boksburg (Netcare Sunward Park) — Mon & Wed
      if (day === 1 || day === 3) {
        slots.push({
          id: `sunward-${dateStr}`,
          date: dateStr, day: dayName,
          site: "Netcare Sunward Park Hospital",
          city: "Boksburg, East Rand",
          doctor: "Dr. Joyce Ziki",
          speciality: "Rheumatologist",
          qualifications: "MBChB, FCP(SA), MMed, Cert Rheum(SA)",
          services: ["New Consultation (R2,600)", "Follow-up (R1,400)", "Joint Injection"],
          slotsAvailable: Math.floor(Math.random() * 2) + 1,
          times: generateTimes(day, true),
          acceptsCash: true,
          acceptsMedicalAid: true,
          waitTimeDays: 5,
        });
      }

      // Pretoria (Life Groenkloof) — Friday
      if (day === 5) {
        slots.push({
          id: `groenkloof-${dateStr}`,
          date: dateStr, day: dayName,
          site: "Life Groenkloof Hospital",
          city: "Pretoria",
          doctor: "Dr. Joyce Ziki",
          speciality: "Rheumatologist",
          qualifications: "MBChB, FCP(SA), MMed, Cert Rheum(SA)",
          services: ["New Consultation (R2,600)", "Follow-up (R1,400)", "Joint Injection"],
          slotsAvailable: Math.floor(Math.random() * 2) + 1,
          times: ["09:00", "10:00", "11:00"],
          acceptsCash: true,
          acceptsMedicalAid: true,
          waitTimeDays: 7,
        });
      }
    }

    return {
      practice: {
        name: "RheumCare Clinic Inc.",
        speciality: "Rheumatology",
        doctors: [
          { name: "Dr. Joyce Ziki", qualifications: "MBChB, FCP(SA), MMed Internal Medicine (Wits), Cert Rheumatology (CMSA)" },
          { name: "Dr. Ivy Anafi", qualifications: "MBChB, FCP(SA), MMed Internal Medicine (Wits), Cert Rheumatology (CMSA)" },
        ],
        conditions: [
          "Rheumatoid Arthritis", "Systemic Lupus Erythematosus (SLE)", "Ankylosing Spondylitis",
          "Psoriatic Arthritis", "Gout (Tophaceous)", "Sjogren's Syndrome", "Systemic Sclerosis",
          "Vasculitis", "Juvenile Idiopathic Arthritis", "Polymyalgia Rheumatica",
        ],
        services: [
          "Specialist consultation", "Biologic infusions (Rituximab, Actemra, Revellex)",
          "Intra-articular joint injections", "Musculoskeletal ultrasound",
          "DAS28 disease activity assessment", "SARAA biologics applications",
          "PMB chronic medication registration", "Clinical trials",
        ],
        sites: getAllSites(),
        whatsappBooking: "https://wa.me/27636661793?text=Hi%2C%20I%27d%20like%20to%20book%20a%20consultation",
        website: "https://www.rheumcare.co.za",
        phone: "011 356 6317",
      },
      availability: slots,
      lastUpdated: new Date().toISOString(),
    };
  }

  return { practice: null, availability: [], lastUpdated: new Date().toISOString() };
}

function generateTimes(day: number, afternoon = false): string[] {
  if (afternoon) return ["14:00", "15:00", "16:00"];
  const times = ["08:30", "09:30", "10:30", "11:30"];
  if (day !== 5) times.push("14:00", "15:00"); // No afternoon on Fridays (Pretoria)
  return times;
}

// GET: Return availability data for a practice
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const practice = searchParams.get("practice") || "rheumcare";

  const data = getAvailability(practice);

  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300", // 5 min cache
    },
  });
}

// POST: GP submits a referral through the availability board
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "public/availability-share/refer", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body = await request.json();
    const {
      slotId,             // Which availability slot they're referring to
      gpName,             // Referring GP name
      gpPractice,         // GP practice name
      gpPhone,            // GP phone
      gpEmail,            // GP email
      patientName,        // Patient name
      patientPhone,       // Patient phone (for WhatsApp pre-qualification)
      patientAge,         // Patient age
      patientGender,      // Patient gender
      referralReason,     // Why referred (e.g., "suspected RA, joint swelling 3 months")
      icd10Suspicion,     // Suspected ICD-10 (e.g., M06.9)
      urgency,            // routine | urgent | emergency
      paymentMethod,      // cash | medical_aid | unknown
      medicalAid,         // If medical_aid, which scheme
      notes,              // Additional notes
    } = body;

    // Validate required fields
    if (!gpName || !patientName || !patientPhone || !referralReason) {
      return NextResponse.json({
        error: "Required: gpName, patientName, patientPhone, referralReason"
      }, { status: 400 });
    }

    // In production: save to DB, trigger WhatsApp pre-qualification, notify practice
    const referralId = `REF-${Date.now().toString(36).toUpperCase()}`;

    // Pre-qualification score (simple heuristic)
    let qualificationScore = 50; // Base
    if (paymentMethod === "cash") qualificationScore += 30; // Cash = guaranteed payment
    if (paymentMethod === "medical_aid" && medicalAid) qualificationScore += 20;
    if (urgency === "urgent" || urgency === "emergency") qualificationScore += 15;
    if (icd10Suspicion) qualificationScore += 10; // GP has a real diagnosis in mind
    qualificationScore = Math.min(qualificationScore, 100);

    const referral = {
      id: referralId,
      status: "pending_qualification",
      qualificationScore,
      qualified: qualificationScore >= 60,
      slotId,
      referringGP: { name: gpName, practice: gpPractice, phone: gpPhone, email: gpEmail },
      patient: {
        name: patientName,
        phone: patientPhone,
        age: patientAge,
        gender: patientGender,
        paymentMethod: paymentMethod || "unknown",
        medicalAid: medicalAid || null,
      },
      clinical: {
        reason: referralReason,
        suspectedDiagnosis: icd10Suspicion || null,
        urgency: urgency || "routine",
        notes: notes || null,
      },
      nextSteps: qualificationScore >= 60
        ? [
            "Patient will be contacted via WhatsApp within 2 hours",
            "Pre-qualification questionnaire sent automatically",
            "Booking confirmed once patient responds",
            "You will receive a confirmation email with appointment details",
          ]
        : [
            "Referral received — our team will review and contact the patient",
            "We may reach out for additional clinical information",
          ],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      referral,
      message: qualificationScore >= 60
        ? `Referral ${referralId} accepted. Patient will be contacted via WhatsApp within 2 hours.`
        : `Referral ${referralId} received. Our team will review and follow up.`,
    });
  } catch {
    return NextResponse.json({ error: "Referral submission failed" }, { status: 500 });
  }
}
