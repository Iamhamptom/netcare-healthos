// GET /api/ml/models — List available Ollama models and their status

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isOllamaAvailable, getAvailableModels } from "@/lib/ml";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "ml-models");
  if (isErrorResponse(guard)) return guard;

  const available = await isOllamaAvailable();
  const models = available ? await getAvailableModels() : [];

  return NextResponse.json({
    ollamaRunning: available,
    models: models.map(m => ({
      name: m,
      role: m.includes("med42") ? "clinical" : m.includes("medllama") ? "knowledge" : "reasoning",
      description: m.includes("med42")
        ? "Medical domain fine-tune — best for ICD-10 coding and clinical diagnosis"
        : m.includes("medllama")
          ? "Medical knowledge model — best for PMB analysis and medical Q&A"
          : "General reasoning — best for structured output and scheme rule analysis",
    })),
    capabilities: available ? [
      "ICD-10 code suggestion (SA coding standards)",
      "Rejection prediction (scheme-specific patterns)",
      "PMB condition analysis (Medical Schemes Act)",
      "Fraud flag explanation (clinical context)",
      "RAG over 300MB health knowledge base",
    ] : ["Models offline — start Ollama with: ollama serve"],
  });
}
