// Twilio integration — WhatsApp, SMS, and Voice (REST API, no SDK)
// Using fetch instead of twilio npm package to avoid Next.js bundling issues

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || "";
const smsFrom = process.env.TWILIO_SMS_NUMBER || "";
const emergencyForwardTo = process.env.EMERGENCY_FORWARD_NUMBER || "";

const TWILIO_API = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;

function authHeader() {
  return "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
}

async function twilioPost(path: string, body: Record<string, string>) {
  if (!accountSid || !authToken) throw new Error("Twilio not configured");

  const res = await fetch(`${TWILIO_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Twilio error ${res.status}`);
  return data;
}

// ─── WhatsApp ──────────────────────────────────────────

/** Send a single WhatsApp message */
export async function sendWhatsApp(to: string, body: string) {
  const data = await twilioPost("/Messages.json", {
    From: `whatsapp:${whatsappFrom}`,
    To: `whatsapp:${to}`,
    Body: body,
  });
  return { sid: data.sid, status: data.status };
}

/** Broadcast WhatsApp message to multiple recipients */
export async function broadcastWhatsApp(recipients: string[], body: string) {
  const results: { to: string; sid?: string; error?: string }[] = [];

  // Send in batches of 10
  for (let i = 0; i < recipients.length; i += 10) {
    const batch = recipients.slice(i, i + 10);
    const promises = batch.map(async (to) => {
      try {
        const data = await twilioPost("/Messages.json", {
          From: `whatsapp:${whatsappFrom}`,
          To: `whatsapp:${to}`,
          Body: body,
        });
        return { to, sid: data.sid };
      } catch (err) {
        return { to, error: err instanceof Error ? err.message : "Failed" };
      }
    });
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  return results;
}

// ─── SMS ───────────────────────────────────────────────

/** Send an SMS */
export async function sendSMS(to: string, body: string) {
  const data = await twilioPost("/Messages.json", {
    From: smsFrom,
    To: to,
    Body: body,
  });
  return { sid: data.sid, status: data.status };
}

// ─── Voice / Emergency ─────────────────────────────────

/** Generate TwiML for emergency call routing */
export function emergencyCallTwiml(practiceName: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-ZA">Thank you for calling ${escapeXml(practiceName)} emergency line.</Say>
  <Gather numDigits="1" action="/api/emergency/route-call" method="POST">
    <Say voice="alice" language="en-ZA">Press 1 for a medical emergency. Press 2 to leave a message for the practice. Press 3 to be connected to the on-call doctor.</Say>
  </Gather>
  ${emergencyForwardTo ? `<Say voice="alice">Connecting you now.</Say><Dial>${emergencyForwardTo}</Dial>` : '<Say voice="alice">Please hold while we connect you.</Say>'}
</Response>`;
}

/** Route emergency call based on digit pressed */
export function routeCallTwiml(digit: string, practiceName: string) {
  switch (digit) {
    case "1":
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-ZA">Connecting you to emergency services.</Say>
  <Dial>${emergencyForwardTo || "+27112333911"}</Dial>
</Response>`;
    case "2":
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-ZA">Please leave a message for ${escapeXml(practiceName)} after the beep.</Say>
  <Record maxLength="120" action="/api/emergency/voicemail" transcribe="true" transcribeCallback="/api/emergency/voicemail"/>
</Response>`;
    case "3":
      if (emergencyForwardTo) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-ZA">Connecting you to the on-call doctor.</Say>
  <Dial>${emergencyForwardTo}</Dial>
</Response>`;
      }
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-ZA">No on-call doctor is currently configured. Please call back during business hours.</Say>
</Response>`;
    default:
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-ZA">Invalid option.</Say>
  <Redirect>/api/emergency</Redirect>
</Response>`;
  }
}

/** Validate Twilio webhook signature (HMAC SHA1) */
export function validateTwilioSignature(url: string, params: Record<string, string>, signature: string): boolean {
  if (!authToken || !signature) return false;
  try {
    const crypto = require("crypto");
    // Build the data string: URL + sorted param key-value pairs
    const data = url + Object.keys(params).sort().reduce((acc, key) => acc + key + params[key], "");
    const hash = crypto.createHmac("sha1", authToken).update(data).digest("base64");
    return hash === signature;
  } catch {
    return false;
  }
}

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
