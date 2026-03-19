import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBLcdDUMLkm86l9u2Dv_FHUgmcS1ySx-7Y" });

async function main() {
  const res = await ai.models.list();
  for await (const m of res) {
    const name = m.name || "";
    if (name.includes("imagen") || name.includes("flash") || name.includes("gemini-2")) {
      console.log(name, JSON.stringify(m.supportedActions || []));
    }
  }
}
main();
