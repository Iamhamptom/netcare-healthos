import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";

/** POST /api/public/symptom-check — AI symptom assessment → service recommendation */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "public/symptom-check", { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { symptoms, slug } = await request.json();

  if (!symptoms || symptoms.length < 5) {
    return NextResponse.json({ error: "Please describe your symptoms in more detail" }, { status: 400 });
  }

  if (symptoms.length > 2000) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  // Demo mode
  if (isDemoMode) {
    return NextResponse.json({
      urgency: "ROUTINE",
      assessment: "Based on your symptoms, you may benefit from an ENT consultation to evaluate your sinus concerns.",
      recommendedService: "Sinus Consultation",
      selfCare: [
        "Use saline nasal rinse twice daily",
        "Stay hydrated — drink 2L water daily",
        "Avoid known allergens and irritants",
        "Use a humidifier in dry weather",
      ],
      shouldBook: true,
      warning: null,
    });
  }

  const systemPrompt = `You are a medical symptom assessment tool for an ENT (Ear, Nose & Throat) practice in South Africa.

YOUR ROLE:
- Assess patient-described symptoms and recommend the appropriate service
- Determine urgency level
- Provide safe self-care tips while recommending professional consultation
- NEVER diagnose — only triage and recommend

AVAILABLE SERVICES (recommend the most appropriate):
- Sinus Consultation (30 min) — blocked nose, sinus headaches, post-nasal drip, facial pain/pressure, loss of smell
- FESS Surgery Consultation (45 min) — chronic sinusitis not responding to medication, nasal polyps, recurrent sinus infections
- Balloon Sinuplasty Consultation (45 min) — alternative to traditional sinus surgery, less invasive option
- Allergy Assessment (30 min) — seasonal allergies, allergic rhinitis, hay fever, persistent sneezing
- Ear Consultation (30 min) — hearing loss, ear pain, tinnitus, ear infections, vertigo/dizziness
- Throat Consultation (30 min) — sore throat, tonsillitis, voice changes, swallowing difficulty
- Septoplasty Consultation (45 min) — deviated septum, breathing obstruction, snoring
- Sleep & Snoring Assessment (45 min) — loud snoring, sleep apnea symptoms, daytime drowsiness
- Paediatric ENT (30 min) — children's ear/nose/throat issues, adenoids, recurring ear infections
- Follow-up Visit (15 min) — post-procedure or treatment check

URGENCY LEVELS:
- EMERGENCY: severe bleeding, difficulty breathing, sudden hearing loss, severe vertigo
- URGENT: high fever with facial swelling, severe ear pain, foreign body in ear/nose/throat
- SEMI-URGENT: worsening symptoms over days, moderate pain, persistent infection signs
- ROUTINE: chronic symptoms, check-ups, mild discomfort

RESPONSE FORMAT (JSON):
{
  "urgency": "ROUTINE|SEMI-URGENT|URGENT|EMERGENCY",
  "assessment": "Brief empathetic assessment of their symptoms (2-3 sentences)",
  "recommendedService": "The most appropriate service from the list above",
  "selfCare": ["3-4 safe self-care tips they can try while waiting for their appointment"],
  "shouldBook": true/false (true unless symptoms are trivial),
  "warning": null or "Important safety message if urgent/emergency"
}

RULES:
- Be warm and reassuring, not alarming
- For EMERGENCY: tell them to go to the nearest ER immediately
- Always recommend booking unless symptoms are clearly self-limiting
- Self-care tips should be safe and evidence-based
- Reference South African context (e.g., Highveld allergies, winter sinus season)`;

  let result = null;

  // Try Gemini first
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const { chat } = await import("@/lib/gemini");
      const text = await chat(systemPrompt, [
        { role: "user", content: `Patient describes their symptoms:\n\n"${symptoms}"` },
      ], { maxTokens: 1024 });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("Gemini symptom check error:", err);
    }
  }

  // Anthropic fallback
  if (!result) {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && anthropicKey !== "your-anthropic-api-key-here") {
      try {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: `Patient describes their symptoms:\n\n"${symptoms}"` }],
        });
        const text = response.content.find(b => b.type === "text")?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) result = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("Anthropic symptom check error:", err);
      }
    }
  }

  // Fallback if no AI available
  if (!result) {
    result = {
      urgency: "ROUTINE",
      assessment: "Thank you for describing your symptoms. We recommend booking a consultation so our specialist can properly assess your condition.",
      recommendedService: "Sinus Consultation",
      selfCare: [
        "Use saline nasal rinse twice daily",
        "Stay hydrated",
        "Avoid known irritants",
        "Take note of when symptoms worsen to share with the doctor",
      ],
      shouldBook: true,
      warning: null,
    };
  }

  return NextResponse.json(result);
}
