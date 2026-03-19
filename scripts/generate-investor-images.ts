/**
 * Generate investor portal images using Gemini 2.5 Flash Image
 * Run: npx tsx scripts/generate-investor-images.ts
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const GEMINI_API_KEY = "AIzaSyBLcdDUMLkm86l9u2Dv_FHUgmcS1ySx-7Y";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const outputDir = path.join(process.cwd(), "public/images/investor");

const imagePrompts = [
  {
    name: "hero-ecosystem",
    prompt: "Generate an image of a sleek digital illustration showing an interconnected healthcare ecosystem. Abstract glowing nodes connected by flowing purple and emerald lines on a dark navy background with subtle grid pattern. Modern, minimal, professional tech aesthetic. No text or words anywhere in the image.",
  },
  {
    name: "product-visiohealth-os",
    prompt: "Generate an image of a modern medical dashboard on a glowing tablet screen. Clean UI showing patient cards, health metrics, and calendar. Purple and emerald accent colors on dark background. Minimal, abstract, futuristic. No text or words.",
  },
  {
    name: "product-placeo-health",
    prompt: "Generate an image of connected glowing location pins on an abstract map representing a doctor-patient network. Purple gradient lines connecting nodes on dark background. No text or words.",
  },
  {
    name: "product-integrator",
    prompt: "Generate an image of abstract API connections between healthcare symbols like lab flasks, pharmacy crosses, hospital buildings, connected by flowing blue data streams on dark background. No text or words.",
  },
  {
    name: "product-waiting-room",
    prompt: "Generate an image of a digital queue display with numbered cards and a glowing smartphone showing a QR code. Sky blue and teal colors on dark background. Modern and clean. No text or words.",
  },
  {
    name: "product-payer-connect",
    prompt: "Generate an image of an abstract golden bridge connecting a medical cross to a shield icon. Flowing amber and gold energy lines on dark background. Professional and minimal. No text or words.",
  },
  {
    name: "product-visiomed-ai",
    prompt: "Generate an image of an AI neural network pattern merging with a medical stethoscope. Pink and purple glowing gradients on dark background. Futuristic healthcare AI concept. No text or words.",
  },
  {
    name: "founder-story",
    prompt: "Generate an image of an atmospheric hospital corridor with warm golden light at the end. A subtle silhouette walking toward the light. Muted purple and gold tones. Cinematic, emotional, dignified. No text or words.",
  },
];

async function generateImage(promptText: string, name: string) {
  console.log(`Generating: ${name}...`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: promptText,
      config: {
        responseModalities: ["image", "text"],
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          const buffer = Buffer.from(part.inlineData.data!, "base64");
          const ext = part.inlineData.mimeType.includes("png") ? "png" : "png";
          const filePath = path.join(outputDir, `${name}.${ext}`);
          fs.writeFileSync(filePath, buffer);
          console.log(`  ✓ Saved: ${filePath} (${(buffer.length / 1024).toFixed(0)}KB)`);
          return true;
        }
      }
    }
    console.log(`  ✗ No image in response`);
    const text = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
    if (text) console.log(`  Text: ${text.substring(0, 150)}`);
    return false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error).substring(0, 300);
    console.log(`  ✗ Failed: ${msg}`);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Generating ${imagePrompts.length} images...\n`);
  let success = 0;
  for (const img of imagePrompts) {
    const result = await generateImage(img.prompt, img.name);
    if (result) success++;
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log(`\nDone: ${success}/${imagePrompts.length} generated → ${outputDir}`);
}

main();
