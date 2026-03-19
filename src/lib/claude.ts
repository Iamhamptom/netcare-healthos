import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant for a healthcare practice's WhatsApp front desk. You help respond to patient messages professionally and warmly.

Guidelines:
- Be friendly, empathetic, and professional
- Keep responses concise (1-3 sentences for WhatsApp)
- For appointment requests, confirm details and suggest available times
- For pricing questions, provide general info and offer to schedule a consultation
- For emergencies, advise calling the practice directly or visiting ER
- For recall/follow-up, gently remind of the importance of regular visits
- Use the patient's name when available
- Never provide medical diagnoses or specific medical advice
- Always offer to connect with a staff member for complex queries`;

export async function generateAIReply(
  patientMessage: string,
  patientName: string,
  practiceType: string,
  aiPersonality: string,
  conversationHistory: { role: string; content: string }[]
): Promise<string> {
  const messages = conversationHistory.map((msg) => ({
    role: (msg.role === "patient" ? "user" : "assistant") as "user" | "assistant",
    content: msg.content,
  }));

  // Ensure messages alternate and start with user
  const cleanMessages: { role: "user" | "assistant"; content: string }[] = [];
  for (const msg of messages) {
    if (cleanMessages.length === 0 && msg.role === "assistant") continue;
    if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === msg.role) continue;
    cleanMessages.push(msg);
  }

  // Add the latest patient message if not already there
  if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].role !== "user") {
    cleanMessages.push({ role: "user", content: patientMessage });
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    system: `${SYSTEM_PROMPT}\n\nPractice type: ${practiceType}\nTone: ${aiPersonality}\nPatient name: ${patientName}`,
    messages: cleanMessages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "I'll have a team member get back to you shortly.";
}
