// POST /api/ml/train — Generate training dataset and export for fine-tuning
// GET /api/ml/train — Get training data statistics

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { generateFullDataset, exportAsJSONL } from "@/lib/ml";
import { join } from "path";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "ml-train");
  if (isErrorResponse(guard)) return guard;

  // Generate dataset with statistics
  const icd10Path = join(process.cwd(), "docs/knowledge/databases/ICD-10_MIT_2021.csv");
  const dataset = generateFullDataset(icd10Path);

  return NextResponse.json({
    totalExamples: dataset.metadata.totalExamples,
    byCategory: dataset.metadata.byCategory,
    generatedAt: dataset.metadata.generatedAt,
    sources: dataset.metadata.sources,
    sampleExamples: dataset.examples.slice(0, 3),
  });
}

export async function POST(req: Request) {
  const guard = await guardRoute(req, "ml-train-generate", { limit: 3 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await req.json();
    const { maxExamples, format } = body;

    const icd10Path = join(process.cwd(), "docs/knowledge/databases/ICD-10_MIT_2021.csv");
    const dataset = generateFullDataset(icd10Path);

    // Limit examples if requested
    if (maxExamples && maxExamples < dataset.examples.length) {
      dataset.examples = dataset.examples.slice(0, maxExamples);
      dataset.metadata.totalExamples = dataset.examples.length;
    }

    if (format === "jsonl") {
      const jsonl = exportAsJSONL(dataset);
      return new NextResponse(jsonl, {
        headers: {
          "Content-Type": "application/jsonl",
          "Content-Disposition": `attachment; filename="healthos-training-${new Date().toISOString().slice(0, 10)}.jsonl"`,
        },
      });
    }

    return NextResponse.json({
      dataset: {
        totalExamples: dataset.metadata.totalExamples,
        byCategory: dataset.metadata.byCategory,
        generatedAt: dataset.metadata.generatedAt,
        sources: dataset.metadata.sources,
      },
      examples: dataset.examples,
      exportFormats: ["jsonl"],
      instructions: {
        ollamaFineTune: "1. Download JSONL: POST /api/ml/train {format: 'jsonl'}\n2. Create Modelfile with FROM and ADAPTER\n3. ollama create healthos-med -f Modelfile",
        usage: "After fine-tuning, update OLLAMA model names in src/lib/ml/ollama.ts",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Training data generation failed" }, { status: 500 });
  }
}
