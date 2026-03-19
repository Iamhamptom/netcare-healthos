/**
 * Generate diverse African healthcare images using Gemini Nano Banana 2
 * Run: npx tsx scripts/generate-health-images.ts
 */

import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const outputDir = path.join(process.cwd(), "public", "images");

// Diverse African healthcare image prompts — all races represented
const IMAGE_PROMPTS: Record<string, string> = {
  // === HERO & BACKGROUND ===
  "hero-bg":
    "A stunning wide-angle photograph of a modern African private healthcare clinic reception. A Black South African female receptionist in professional attire warmly greets a young Indian couple at the sleek white desk. Warm golden hour lighting, polished floors, lush indoor plants, floor-to-ceiling windows. Green LED accent strip under the desk. Modern, luxurious, warm. Ultra-realistic, cinematic, 8K. No text or logos.",

  // === TESTIMONIAL PORTRAITS ===
  "portrait-sarah":
    "A candid editorial portrait of a real Coloured South African female dentist, age 34, photographed in her actual dental practice in Sandton, Johannesburg. She wears a slightly wrinkled white lab coat over teal scrubs — the coat has a small pen stain near the pocket. Her curly brown hair is loosely tied back with stray wisps framing her face. She has visible laugh lines, natural skin texture with pores and slight under-eye circles from long shifts. Warm, genuine half-smile — not posed, caught mid-conversation. Soft golden window light from the left creates natural shadows. Background: real blurred dental chair and overhead lamp, a wall-mounted X-ray viewer. Shot on Canon R5 with 85mm f/1.4 lens. Shallow depth of field. Natural color grading, no filters. Absolutely no text, no logos, no watermarks. Photojournalistic style.",

  "portrait-thabo":
    "A candid editorial portrait of a real Black South African male radiologist, age 45, photographed in a radiology reading room. He wears a navy blue scrub top under a white lab coat, stethoscope draped casually around his neck. His dark skin shows natural texture — visible pores on his forehead, slight grey at his temples, a small shaving nick on his jaw. He has deep brown eyes with a calm, experienced expression — not smiling, just quietly confident. He's leaning slightly against a desk. Background: two large medical monitors showing blurred CT scans, the cool blue-white glow illuminating his face from behind. Overhead fluorescent lighting mixed with screen glow. Shot on Sony A7R IV with 50mm f/1.2 lens. Natural, unretouched skin. Absolutely no text, no logos, no watermarks. Documentary photography style.",

  "portrait-lisa":
    "A candid editorial portrait of a real White South African woman, age 37, wellness spa owner in Rosebank, Johannesburg. She wears a linen sage green button-up blouse with sleeves rolled to the elbows, a delicate gold watch on her wrist. Her ash-blonde hair falls naturally past her shoulders with slight waves — not salon-perfect. She has faint freckles across her nose, natural crow's feet when she smiles, visible collarbone. She's caught mid-laugh leaning against a doorframe. Background: out-of-focus luxury spa interior with warm Edison bulb lighting, a monstera plant, stacked white towels. Late afternoon golden light from a nearby window. Shot on Fuji GFX 100S medium format, 80mm f/1.7. Film-like color grading with warm tones. Absolutely no text, no logos, no watermarks. Lifestyle editorial style.",

  // === ABOUT PAGE ===
  "about-team":
    "A photojournalistic wide shot of a real diverse South African healthcare startup team during a working meeting in a modern Sandton office boardroom. Five people around a wooden conference table covered in papers, laptops, coffee cups. A Black male doctor (40s, white coat, reading glasses pushed up on his head) gestures at a wall-mounted 65-inch TV showing blurred analytics charts. An Indian female nurse (30s, navy scrubs, hair in a practical bun) takes notes on a laptop. A Coloured male developer (late 20s, casual hoodie, mechanical keyboard) types while looking at the screen. A White female operations manager (40s, blazer, reading glasses) reviews a printed report. A Black female data analyst (30s, natural afro, bright yellow blouse) points at something on her tablet screen. The room has floor-to-ceiling windows showing a Johannesburg skyline, a potted fiddle-leaf fig, whiteboards with sticky notes. Natural afternoon light casts long shadows. Some people mid-gesture, some looking at the TV — not everyone looking at the camera. Shot on Canon R5 with 24mm f/2.8. Documentary corporate photography. Absolutely no text, no logos, no watermarks.",

  "about-clinic":
    "A real interior photograph of a modern private dental practice in Pretoria, South Africa. A Black female dentist (late 30s, surgical loupes on her head, purple nitrile gloves) leans over a Coloured male patient (30s, reclined in a Kavo dental chair with a blue paper bib). She holds a dental mirror and explorer. The patient's mouth is open, the overhead dental light is on casting a focused beam. The room has warm oak cabinetry, a small window with privacy frosting letting in soft daylight, a wall-mounted monitor showing a dental X-ray. Subtle details: a tray of sterilized instruments in pouches, a box of gloves on the counter, a small succulent plant on the windowsill. The floor is grey vinyl. Everything looks used and real — not a showroom. Shot on Sony A7 III with 35mm f/1.8. Natural mixed lighting (window + dental lamp + overhead). Absolutely no text, no logos, no watermarks. Healthcare documentary photography.",

  // === HOW IT WORKS ===
  "step-whatsapp":
    "A candid photograph of a young Black South African woman (mid-20s, box braids, casual denim jacket over a white t-shirt) sitting at a wooden table in a real Johannesburg coffee shop. She holds her iPhone naturally in one hand, scrolling through a WhatsApp conversation — the green chat bubbles are barely visible on the small screen. She has a slight relieved smile, not looking at camera. A half-finished flat white and a croissant on a ceramic plate sit on the table. Through the window behind her: a jacaranda tree with purple blossoms, parked cars, a Gautrain bus stop sign. Warm afternoon light creates lens flare from the window. A couple of other patrons blurred in the background. Shot on Fuji X-T5 with 56mm f/1.2. Street photography style, natural grain. Absolutely no text, no logos, no watermarks.",

  "step-ai-chat":
    "A close-up photograph of a real office desk setup. A 27-inch Dell monitor displays a modern chat interface with green accent colors — the conversation text is too small to read, just abstract colored message bubbles. Next to the monitor: a real Littmann stethoscope draped over a stack of manila patient folders, a half-drunk coffee in a ceramic mug with a tea stain, a wireless mouse, scattered sticky notes. The desk surface is light birch wood with visible grain. Soft warm desk lamp light from the left. The rest of the office is dark and blurred — shelves with medical reference books visible. Shot on Canon R6 with 35mm f/1.4. Shallow depth of field focused on the stethoscope and screen. Moody editorial product photography. Absolutely no text, no logos, no watermarks.",

  "step-booking":
    "A candid photograph in a real modern medical practice reception area. An Indian South African female receptionist (early 30s, neat black hair in a low ponytail, maroon scrub top, small gold nose stud) sits behind a clean white reception desk, holding an iPad at an angle showing a calendar view. She smiles naturally across the counter at a tall Black South African male patient (mid-30s, neat beard, navy polo shirt, backpack strap over one shoulder) who's leaning one elbow on the counter. The reception area has a frosted glass partition, a small potted snake plant, a hand sanitizer dispenser mounted on the wall, a few magazines on the waiting area table behind the patient. Overhead LED panel lighting mixed with daylight from a glass entrance door. Both people appear relaxed and mid-conversation. Shot on Nikon Z6 II with 50mm f/1.8. Lifestyle documentary style. Absolutely no text, no logos, no branded signage, no watermarks.",

  "step-followup":
    "A warm candid photograph in a real medical examination room. A Coloured South African male nurse (late 30s, neat fade haircut, small earring, blue scrubs with a clip-on ID badge) sits on a rolling stool, holding a Samsung tablet showing a chart (screen partially visible but text unreadable). He's turned toward a White elderly South African female patient (early 70s, short silver hair, reading glasses on a chain around her neck, wearing a hospital gown over her own clothes). She sits on the exam table with her legs dangling, leaning forward to look at the tablet with an interested expression. The room has a blood pressure cuff mounted on the wall, a sharps disposal container, a window with vertical blinds letting in warm afternoon light, medical gloves box on the counter. Natural, lived-in medical environment. Shot on Sony A7 III with 55mm f/1.8. Warm natural tones. Documentary healthcare photography. Absolutely no text, no logos, no watermarks.",

  // === VERTICALS ===
  "verticals-panel":
    "A dramatic four-panel split composition: TOP-LEFT: Modern dental clinic with a Black female dentist treating an Indian patient. TOP-RIGHT: Radiology suite with a White male radiologist reviewing scans. BOTTOM-LEFT: Luxury wellness spa with a Coloured female therapist and client. BOTTOM-RIGHT: Hospital corridor with diverse medical staff walking. Each panel separated by thin glowing green lines. Cinematic, premium, 8K.",

  // === FEATURES ===
  "features-botanical":
    "A beautiful flat-lay photograph on a dark emerald marble surface. A rose-gold stethoscope, a tablet showing colorful health charts with green accents, fresh protea flowers (South African), a ceramic coffee cup, and a smartphone showing a WhatsApp conversation. Soft overhead lighting, clean and organized. Premium medical aesthetic with African botanical touches. Ultra-realistic, 8K, editorial photography.",

  // === DASHBOARD ===
  "dashboard-preview":
    "A photorealistic image of a Black South African healthcare administrator sitting at a curved ultrawide monitor showing a modern health analytics dashboard. Green charts, patient statistics, and booking graphs on screen. Dark premium office with ambient green LED backlighting behind the monitor. The person is professionally dressed, reviewing data. Shallow depth of field, cinematic lighting. 8K.",
};

async function generateImage(key: string, prompt: string): Promise<string | null> {
  console.log(`\n🎨 Generating: ${key}...`);

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
      console.log(`  ⚠️  No candidates returned for ${key}`);
      return null;
    }

    for (const part of candidates[0].content?.parts || []) {
      if (part.inlineData) {
        const imageBytes = Buffer.from(part.inlineData.data!, "base64");
        const filename = `${key}.png`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, imageBytes);
        console.log(`  ✅ Saved: /images/${filename} (${(imageBytes.length / 1024).toFixed(0)}KB)`);
        return `/images/${filename}`;
      }
    }

    console.log(`  ⚠️  No image data in response for ${key}`);
    return null;
  } catch (err) {
    console.error(`  ❌ Error generating ${key}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function main() {
  console.log("🏥 VisioHealth OS — Diverse African Healthcare Image Generator");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`Output: ${outputDir}`);
  console.log(`Images to generate: ${Object.keys(IMAGE_PROMPTS).length}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get specific images from CLI args, or generate all
  const args = process.argv.slice(2);
  const keysToGenerate = args.length > 0
    ? args.filter((k) => k in IMAGE_PROMPTS)
    : Object.keys(IMAGE_PROMPTS);

  if (args.length > 0 && keysToGenerate.length === 0) {
    console.log(`\nAvailable keys: ${Object.keys(IMAGE_PROMPTS).join(", ")}`);
    process.exit(1);
  }

  const results: Record<string, string | null> = {};

  for (const key of keysToGenerate) {
    results[key] = await generateImage(key, IMAGE_PROMPTS[key]);
    // Small delay between requests to avoid rate limiting
    if (keysToGenerate.indexOf(key) < keysToGenerate.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("📊 Results:");
  const success = Object.values(results).filter(Boolean).length;
  const failed = Object.values(results).filter((v) => !v).length;

  for (const [key, path] of Object.entries(results)) {
    console.log(`  ${path ? "✅" : "❌"} ${key}: ${path || "FAILED"}`);
  }

  console.log(`\n✅ ${success} generated | ❌ ${failed} failed`);
}

main().catch(console.error);
