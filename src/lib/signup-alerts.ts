// Signup alert system — notifies Dr. Hampton when someone registers
// Channels: ntfy.sh (push), Resend (email), Visio Gateway (agent comms)

const OWNER_EMAIL = process.env.ALERT_EMAIL || "davidhampton@hamptongroupafrica.com";
const NTFY_TOPIC = process.env.NTFY_TOPIC || "healthops-hga-signups-x7k9";

interface SignupInfo {
  name: string;
  email: string;
  userId: string;
}

/** Send push notification via ntfy.sh — instant, free, no API key needed */
async function notifyViaNtfy(info: SignupInfo) {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        Title: "New HealthOps Signup",
        Priority: "high",
        Tags: "tada,health",
      },
      body: `${info.name} (${info.email}) just signed up for Netcare Health OS OS`,
    });
  } catch {
    console.error("[signup-alert] ntfy.sh failed");
  }
}

/** Send email notification via Resend */
async function notifyViaEmail(info: SignupInfo) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { sendEmail } = await import("@/lib/resend");
    await sendEmail({
      to: OWNER_EMAIL,
      subject: `New Signup: ${info.name} — Netcare Health OS OS`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#1a1a1a;margin:0 0 16px;">New User Registered</h2>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;color:#333;"><strong>Name:</strong> ${info.name}</p>
            <p style="margin:4px 0;color:#333;"><strong>Email:</strong> ${info.email}</p>
            <p style="margin:4px 0;color:#333;"><strong>User ID:</strong> ${info.userId}</p>
            <p style="margin:4px 0;color:#999;font-size:12px;"><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="color:#555;font-size:13px;">— Netcare Health OS OS Signup Alert</p>
        </div>`,
    });
  } catch {
    console.error("[signup-alert] Resend email failed");
  }
}

/** Ping Visio Workspace gateway so Robocorpo/Steinberg know */
async function notifyViaGateway(info: SignupInfo) {
  const url = process.env.VISIO_GATEWAY_URL;
  const key = process.env.VISIO_GATEWAY_KEY;
  if (!url || !key) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        command: `Log new HealthOps signup: ${info.name} (${info.email}), user ID ${info.userId}. Create a task to follow up with this lead.`,
      }),
    });
  } catch {
    console.error("[signup-alert] Gateway ping failed");
  }
}

/** Fire all signup notifications (non-blocking — errors don't affect registration) */
export function sendSignupAlerts(info: SignupInfo) {
  // Fire and forget — don't await, don't block the response
  Promise.allSettled([
    notifyViaNtfy(info),
    notifyViaEmail(info),
    notifyViaGateway(info),
  ]).catch(() => {});
}
