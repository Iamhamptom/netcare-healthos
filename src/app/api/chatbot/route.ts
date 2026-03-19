import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";

const CHATBOT_SYSTEM = `You are a friendly, professional healthcare practice assistant chatbot on the Netcare Health OS Ops website. You help potential and existing patients with:

- Booking appointments (suggest they call or use the booking page)
- Answering common questions about services, pricing, hours
- Providing practice information
- Handling basic triage (if they describe symptoms, recommend appropriate urgency)

PRACTICE INFO:
- Name: Smile Dental — Sandton
- Hours: Mon-Fri 8:00-17:00, Sat 8:00-13:00
- Phone: +27 11 783 4500
- Address: 45 Rivonia Rd, Sandton, 2196
- Services: General dentistry, cosmetic, whitening, implants, orthodontics, emergency
- Medical aids accepted: Discovery, Bonitas, Momentum, Medihelp, and more

RULES:
- Be concise (2-4 sentences max)
- Be warm and professional
- Never diagnose — recommend they visit for a proper assessment
- For emergencies: tell them to call immediately or go to ER
- Offer to connect them with staff for complex queries`;

/** POST /api/chatbot — Public patient-facing chatbot (no auth required) */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "chatbot", { limit: 15, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const message = String(body.message || "").trim();
  const sessionHistory = (body.history || []) as { role: string; content: string }[];

  if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });
  if (message.length > 1000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  // In demo mode, use mock responses
  if (isDemoMode) {
    return NextResponse.json({ reply: getChatbotMockReply(message), actions: [] });
  }

  // Try Gemini first, then Anthropic, then mock
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const chatMessages = sessionHistory.slice(-10).map(msg => ({
    role: (msg.role === "user" ? "user" : "model") as "user" | "model",
    content: msg.content,
  }));
  chatMessages.push({ role: "user", content: message });

  // Gemini
  if (geminiKey) {
    try {
      const { chat } = await import("@/lib/gemini");
      const reply = await chat(CHATBOT_SYSTEM, chatMessages, { maxTokens: 512 });
      return NextResponse.json({ reply, actions: [] });
    } catch (err) {
      console.error("Gemini chatbot error:", err);
      // Fall through to Anthropic
    }
  }

  // Anthropic fallback
  if (anthropicKey && anthropicKey !== "your-anthropic-api-key-here") {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({ apiKey: anthropicKey });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        system: CHATBOT_SYSTEM,
        messages: chatMessages.map(m => ({ role: m.role === "model" ? "assistant" as const : "user" as const, content: m.content })),
      });

      const reply = response.content.find(b => b.type === "text")?.text || "Please call us at +27 11 783 4500.";
      return NextResponse.json({ reply, actions: [] });
    } catch (err) {
      console.error("Anthropic chatbot error:", err);
    }
  }

  // Mock fallback
  return NextResponse.json({ reply: getChatbotMockReply(message), actions: [] });
}

function getChatbotMockReply(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("book") || lower.includes("appointment")) {
    return "I'd love to help you book! You can call us at +27 11 783 4500 or use our online booking page. We have slots available this week — what service do you need?";
  }
  if (lower.includes("hour") || lower.includes("open") || lower.includes("time")) {
    return "We're open Monday to Friday 8:00–17:00 and Saturdays 8:00–13:00. Would you like to book an appointment?";
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
    return "Pricing varies by treatment. Consultations start from R450, cleanings from R650, and whitening from R2,500. We accept all major medical aids. Want me to help you book a free consultation?";
  }
  if (lower.includes("emergency") || lower.includes("pain") || lower.includes("urgent")) {
    return "I'm sorry you're in pain. For dental emergencies, please call us immediately at +27 11 783 4500 — we always prioritise urgent cases. If it's severe, head to your nearest ER.";
  }
  if (lower.includes("medical aid") || lower.includes("insurance") || lower.includes("discovery")) {
    return "We accept Discovery Health, Bonitas, Momentum, Medihelp, and most other South African medical aids. We can check your benefits before your appointment.";
  }
  if (lower.includes("where") || lower.includes("address") || lower.includes("location") || lower.includes("directions")) {
    return "We're at 45 Rivonia Rd, Sandton, 2196 — easy to find and plenty of parking. Would you like to book a visit?";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! Welcome to Smile Dental Sandton. I can help you with bookings, pricing, practice info, or answer any questions. What can I do for you?";
  }
  return "Thanks for your message! I can help with bookings, pricing, practice hours, and general questions. For anything specific, our team is available at +27 11 783 4500.";
}
