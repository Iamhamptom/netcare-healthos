// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Training Data & Model Versioning
//
// Tracks which training data produced which adapter checkpoint.
// Each fine-tuning run creates a version manifest linking:
// - Training data hash (SHA-256 of JSONL content)
// - Dataset statistics (examples by category, total count)
// - Adapter checkpoint path
// - Evaluation metrics at that checkpoint
// - Timestamp and run configuration
//
// Enables:
// - Reproducibility (re-run any training version)
// - A/B comparison between adapter versions
// - Rollback to known-good adapters
// - Audit trail for clinical compliance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TrainingVersion {
  version: string;
  createdAt: string;
  dataHash: string;
  dataStats: {
    totalExamples: number;
    byCategory: Record<string, number>;
    sources: string[];
  };
  config: {
    baseModel: string;
    loraRank: number;
    learningRate: number;
    iterations: number;
    batchSize: number;
  };
  adapterPath: string;
  checkpoints: string[];
  evaluation?: {
    compositeScore: number;
    accuracy: number;
    piiCompliant: boolean;
    clinicalReadiness: string;
  };
  notes: string;
}

export interface VersionManifest {
  currentVersion: string;
  versions: TrainingVersion[];
  lastUpdated: string;
}

// ─── Paths ──────────────────────────────────────────────────────────────────

const ML_DIR = join(process.cwd(), "ml");
const VERSIONS_DIR = join(ML_DIR, "versions");
const MANIFEST_PATH = join(VERSIONS_DIR, "manifest.json");

// ─── Core Functions ─────────────────────────────────────────────────────────

/**
 * Hash training data content for reproducibility tracking.
 */
export function hashTrainingData(jsonlContent: string): string {
  return createHash("sha256").update(jsonlContent).digest("hex").slice(0, 16);
}

/**
 * Create a new training version record.
 */
export function createVersion(params: {
  jsonlContent: string;
  dataStats: TrainingVersion["dataStats"];
  config: TrainingVersion["config"];
  adapterPath: string;
  notes?: string;
}): TrainingVersion {
  const manifest = loadManifest();
  const versionNum = manifest.versions.length + 1;
  const version = `v${versionNum}.0`;

  // Find checkpoint files in the adapter directory
  const checkpoints: string[] = [];
  try {
    const files = readdirSync(params.adapterPath);
    for (const f of files) {
      if (f.endsWith("_adapters.safetensors")) {
        checkpoints.push(f);
      }
    }
  } catch {
    // Adapter directory might not exist yet
  }

  const tv: TrainingVersion = {
    version,
    createdAt: new Date().toISOString(),
    dataHash: hashTrainingData(params.jsonlContent),
    dataStats: params.dataStats,
    config: params.config,
    adapterPath: params.adapterPath,
    checkpoints: checkpoints.sort(),
    notes: params.notes || "",
  };

  manifest.versions.push(tv);
  manifest.currentVersion = version;
  manifest.lastUpdated = new Date().toISOString();
  saveManifest(manifest);

  return tv;
}

/**
 * Attach evaluation results to a training version.
 */
export function attachEvaluation(version: string, evaluation: TrainingVersion["evaluation"]): void {
  const manifest = loadManifest();
  const tv = manifest.versions.find(v => v.version === version);
  if (!tv) throw new Error(`Version ${version} not found`);

  tv.evaluation = evaluation;
  manifest.lastUpdated = new Date().toISOString();
  saveManifest(manifest);
}

/**
 * Get the current active version.
 */
export function getCurrentVersion(): TrainingVersion | null {
  const manifest = loadManifest();
  return manifest.versions.find(v => v.version === manifest.currentVersion) || null;
}

/**
 * List all training versions.
 */
export function listVersions(): TrainingVersion[] {
  return loadManifest().versions;
}

/**
 * Rollback to a previous version (updates the currentVersion pointer).
 */
export function rollbackTo(version: string): void {
  const manifest = loadManifest();
  if (!manifest.versions.find(v => v.version === version)) {
    throw new Error(`Version ${version} not found`);
  }
  manifest.currentVersion = version;
  manifest.lastUpdated = new Date().toISOString();
  saveManifest(manifest);
}

// ─── Manifest I/O ───────────────────────────────────────────────────────────

function loadManifest(): VersionManifest {
  try {
    if (existsSync(MANIFEST_PATH)) {
      return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
    }
  } catch {
    // Corrupt manifest — start fresh
  }
  return { currentVersion: "v0.0", versions: [], lastUpdated: new Date().toISOString() };
}

function saveManifest(manifest: VersionManifest): void {
  mkdirSync(VERSIONS_DIR, { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}
