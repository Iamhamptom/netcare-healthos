import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";
import path from "path";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Diverse African healthcare image prompts — all races represented
const IMAGE_PROMPTS: Record<string, string> = {
  "hero-bg": "A stunning wide-angle photograph of a modern African private healthcare clinic reception. A Black South African female receptionist in professional attire warmly greets a young Indian couple at the sleek white desk. Warm golden hour lighting, polished floors, lush indoor plants, floor-to-ceiling windows. Green LED accent strip under the desk. Modern, luxurious, warm. Ultra-realistic, cinematic, 8K. No text or logos.",

  "intro-bg": "An abstract artistic photograph of flowing green aurora borealis light trails against a deep black background. Organic, ethereal glowing ribbons of emerald green (#34D399) and teal (#2DD4BF) light dancing through darkness. Ultra-smooth, glossy, liquid-like reflections. Feels premium, alive, and mesmerizing. No text, no people. 8K quality, long exposure photography style.",

  "features-botanical": "A beautiful flat-lay photograph on a dark emerald marble surface. A rose-gold stethoscope, a tablet showing colorful health charts with green accents, fresh protea flowers (South African), a ceramic coffee cup, and a smartphone showing a WhatsApp conversation. Soft overhead lighting, clean and organized. Premium medical aesthetic with African botanical touches. Ultra-realistic, 8K, editorial photography.",

  "dashboard-preview": "A photorealistic image of a Black South African healthcare administrator sitting at a curved ultrawide monitor showing a modern health analytics dashboard. Green charts, patient statistics, and booking graphs on screen. Dark premium office with ambient green LED backlighting behind the monitor. The person is professionally dressed, reviewing data. Shallow depth of field, cinematic lighting. 8K.",

  "portrait-sarah": "Professional portrait of a confident Coloured South African female dentist in her mid-30s, wearing a crisp white lab coat over emerald scrubs. Warm brown skin, curly hair pulled back neatly. Standing in a modern dental clinic with soft window light. Genuine warm smile. Bokeh background of blurred dental equipment. Medium format camera quality. 8K resolution. Photorealistic.",

  "portrait-thabo": "Professional portrait of a distinguished Black South African male radiologist in his 40s, wearing a white lab coat with a stethoscope. Kind, authoritative expression. Dark skin, short neat hair. Standing in front of a modern radiology viewing screen showing an X-ray (blurred). Soft blue-white ambient lighting. Editorial quality. 8K resolution. Photorealistic.",

  "portrait-lisa": "Professional portrait of a confident White South African female wellness spa manager in her late 30s, wearing an elegant sage green blouse. Blonde hair in a professional style. Standing in a luxury wellness spa with soft warm lighting, candles and plants visible in bokeh background. Friendly expression. Editorial portrait photography. 8K resolution. Photorealistic.",

  "verticals-panel": "A dramatic four-panel split composition: TOP-LEFT: Modern dental clinic with a Black female dentist treating an Indian patient. TOP-RIGHT: Radiology suite with a White male radiologist reviewing scans. BOTTOM-LEFT: Luxury wellness spa with a Coloured female therapist and client. BOTTOM-RIGHT: Hospital corridor with diverse medical staff walking. Each panel separated by thin glowing green lines. Cinematic, premium, 8K.",

  "about-team": "A wide photograph of a diverse South African healthcare team meeting in a modern boardroom. Five people around a glass table with a large screen showing health analytics: a Black male doctor in white coat, an Indian female nurse, a Coloured male IT specialist with laptop, a White female practice manager, and a Black female data analyst. All engaged in discussion, some smiling. Modern office with plants and natural light. Ultra-realistic, cinematic, 8K.",

  "about-clinic": "Interior photograph of a beautiful modern African private dental clinic. A Black female dentist examining a Coloured male patient in a state-of-the-art dental chair. Warm wood accents, emerald green accent walls, modern equipment, natural light from large windows. Clean, professional, premium feel. African art on walls. Ultra-realistic, 8K quality.",

  "step-whatsapp": "Photograph of a young Black South African woman in casual smart attire sitting in a cafe, looking at her smartphone with WhatsApp open. The screen shows a friendly conversation with a healthcare chatbot (slightly visible). She looks pleased and relieved. Warm natural lighting, shallow depth of field. Modern Johannesburg cafe setting visible through windows. Ultra-realistic, 8K.",

  "step-ai-chat": "Photograph of a modern computer screen showing an AI healthcare chat interface with green accent colors, alongside a desk with a stethoscope and coffee cup. The screen shows a clean conversation UI with patient booking details (text blurred/abstract). Soft ambient office lighting, dark premium workspace. Ultra-realistic, 8K.",

  "step-booking": "Photograph of an Indian South African female receptionist at a modern healthcare desk, confirming a booking on a tablet while smiling at a Black male patient across the counter. Modern clinic interior with white and green accents. Both people look happy and engaged. Natural lighting, professional setting. Ultra-realistic, 8K.",

  "step-followup": "Photograph of a Coloured South African male nurse doing a post-procedure check-in with a White elderly female patient in a modern, well-lit examination room. He is showing her results on a tablet. Both look comfortable and engaged. Warm, caring atmosphere. Modern medical equipment visible. Ultra-realistic, 8K.",

  "cta-orbs": "An abstract digital art piece of luminous green and teal glass orbs floating in a dark void. The spheres are translucent, glossy, and reflective with internal glowing light. Some orbs overlap creating beautiful color mixing effects. Emerald green (#34D399) and teal (#2DD4BF) against pure black (#030F07). Feels futuristic and alive. No text. 8K quality.",

  "pattern-grid": "An abstract minimalist pattern of thin glowing green (#34D399) geometric lines forming a perspective grid that fades into a dark background (#030F07). The lines have a subtle glow effect. Clean, modern, technical feel. Like a holographic wireframe landscape. No text. High resolution.",
};

export async function POST(request: Request) {
  // Auth: platform admin only + rate limit 5/min (image gen is expensive)
  const guard = await guardPlatformAdmin(request, "generate-images", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  try {
    const { images } = await request.json();
    const imagesToGenerate = images || Object.keys(IMAGE_PROMPTS);
    const outputDir = path.join(process.cwd(), "public", "images");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const results: Record<string, string> = {};

    for (const imageKey of imagesToGenerate) {
      const prompt = IMAGE_PROMPTS[imageKey];
      if (!prompt) {
        results[imageKey] = "unknown prompt key";
        continue;
      }

      try {
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: prompt,
          config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
          },
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
          results[imageKey] = "no candidates returned";
          continue;
        }

        for (const part of candidates[0].content?.parts || []) {
          if (part.inlineData) {
            const imageBytes = Buffer.from(part.inlineData.data!, "base64");
            const filename = `${imageKey}.png`;
            const filepath = path.join(outputDir, filename);
            fs.writeFileSync(filepath, imageBytes);
            results[imageKey] = `/images/${filename}`;
            break;
          }
        }

        if (!results[imageKey]) {
          results[imageKey] = "no image in response";
        }
      } catch (err) {
        results[imageKey] = `error: ${err instanceof Error ? err.message : "unknown"}`;
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate images" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "generate-images", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  return NextResponse.json({
    available: Object.keys(IMAGE_PROMPTS),
    usage: "POST with { images: ['hero-bg', 'intro-bg'] } or omit to generate all",
  });
}
