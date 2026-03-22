// POST /api/ml/train — Generate training dataset and export for fine-tuning
// GET /api/ml/train — Get training data statistics
// mode=comprehensive → ALL 100K+ examples from every knowledge source
// mode=basic (default) → original ICD-10 focused dataset

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { generateFullDataset, exportAsJSONL } from "@/lib/ml";
import { generateComprehensiveDataset, exportComprehensiveJSONL } from "@/lib/ml/training-data-comprehensive";
import { createVersion, getCurrentVersion, listVersions } from "@/lib/ml/versioning";
import { join } from "path";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "ml-train");
  if (isErrorResponse(guard)) return guard;

  // Show comprehensive dataset stats by default
  const comprehensive = generateComprehensiveDataset();

  return NextResponse.json({
    totalExamples: comprehensive.metadata.totalExamples,
    byCategory: comprehensive.metadata.byCategory,
    generatedAt: comprehensive.metadata.generatedAt,
    sources: comprehensive.metadata.sources,
    currentVersion: getCurrentVersion(),
    allVersions: listVersions(),
    modes: {
      comprehensive: `${comprehensive.metadata.totalExamples} examples — ALL knowledge domains (ICD-10, FHIR, HL7v2, schemes, PMB, CDL, fraud, clinical, compliance, tariffs, medicines, workflows)`,
      basic: "Original ICD-10 focused dataset (~40K examples)",
    },
  });
}

export async function POST(req: Request) {
  const guard = await guardRoute(req, "ml-train-generate", { limit: 3 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await req.json();
    const { maxExamples, format, mode } = body;

    // mode=comprehensive (default now) uses ALL knowledge sources
    const useComprehensive = mode !== "basic";

    if (format === "jsonl") {
      let jsonl: string;
      let totalExamples: number;
      let byCategory: Record<string, number>;
      let sources: string[];

      if (useComprehensive) {
        const result = exportComprehensiveJSONL();
        jsonl = result.jsonl;
        byCategory = result.stats;
        totalExamples = jsonl.split("\n").filter(Boolean).length;
        sources = ["comprehensive — all knowledge domains"];
      } else {
        const icd10Path = join(process.cwd(), "docs/knowledge/databases/ICD-10_MIT_2021.csv");
        const dataset = generateFullDataset(icd10Path);
        jsonl = exportAsJSONL(dataset);
        totalExamples = dataset.metadata.totalExamples;
        byCategory = dataset.metadata.byCategory;
        sources = dataset.metadata.sources;
      }

      // Auto-version
      try {
        createVersion({
          jsonlContent: jsonl,
          dataStats: { totalExamples, byCategory, sources },
          config: {
            baseModel: "m42-health/med42-v2-8b",
            loraRank: 8,
            learningRate: 0.00001,
            iterations: 500,
            batchSize: 2,
          },
          adapterPath: join(process.cwd(), "ml/models/healthos-adapter"),
          notes: `${useComprehensive ? "COMPREHENSIVE" : "basic"} export ${new Date().toISOString().slice(0, 10)} — ${totalExamples} examples`,
        });
      } catch {
        // Non-blocking
      }

      return new NextResponse(jsonl, {
        headers: {
          "Content-Type": "application/jsonl",
          "Content-Disposition": `attachment; filename="healthos-training-${useComprehensive ? "comprehensive" : "basic"}-${new Date().toISOString().slice(0, 10)}.jsonl"`,
        },
      });
    }

    // Non-JSONL: return stats + sample
    const dataset = useComprehensive
      ? generateComprehensiveDataset()
      : (() => {
          const icd10Path = join(process.cwd(), "docs/knowledge/databases/ICD-10_MIT_2021.csv");
          return generateFullDataset(icd10Path);
        })();

    const examples = maxExamples ? dataset.examples.slice(0, maxExamples) : dataset.examples;

    return NextResponse.json({
      mode: useComprehensive ? "comprehensive" : "basic",
      dataset: {
        totalExamples: dataset.metadata.totalExamples,
        byCategory: dataset.metadata.byCategory,
        generatedAt: dataset.metadata.generatedAt,
        sources: dataset.metadata.sources,
      },
      currentVersion: getCurrentVersion(),
      allVersions: listVersions(),
      sampleExamples: examples.slice(0, 5),
      exportFormats: ["jsonl"],
      instructions: {
        comprehensive: "POST /api/ml/train {format: 'jsonl', mode: 'comprehensive'} — ALL 100K+ examples",
        basic: "POST /api/ml/train {format: 'jsonl', mode: 'basic'} — ICD-10 focused ~40K examples",
        fineTune: "1. Download JSONL\n2. Split: 90% train, 5% valid, 5% test\n3. python -m mlx_lm.lora --model ml/models/med42-mlx --data ml/training-data --adapter ml/models/healthos-adapter --iters 1000\n4. ollama create healthos-med -f ml/Modelfile",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Training data generation failed" }, { status: 500 });
  }
}
