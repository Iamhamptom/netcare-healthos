/**
 * HealthOS-Med RAG — Shared retrieval module
 * Used by /api/rag and /api/claims-copilot
 * Works on Vercel (no external server needed)
 */

import fs from "fs";
import path from "path";

interface RAGDoc {
  id: string;
  text: string;
  metadata: { source: string; filename: string; category: string; priority: number };
}

interface LookupRow {
  [key: string]: string;
}

let icd10Map: Map<string, LookupRow> | null = null;
let tariffMap: Map<string, { code: string; description: string; rates: Record<string, number> }> | null = null;
let medicineMap: Map<string, LookupRow> | null = null;
let rejectionMap: Map<string, LookupRow> | null = null;
let cdlMap: Map<string, LookupRow> | null = null;
let ragDocs: RAGDoc[] | null = null;

function getDataPath(filename: string): string {
  return path.join(process.cwd(), "docs/knowledge/databases", filename);
}

function loadCSV(filePath: string): LookupRow[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: LookupRow = {};
    headers.forEach((h, i) => {
      row[h] = vals[i] || "";
    });
    return row;
  });
}

function ensureLoaded() {
  if (icd10Map) return;

  icd10Map = new Map();
  for (const row of loadCSV(getDataPath("ICD-10_MIT_2021.csv"))) {
    const code = (row.ICD10_Code || "").trim().toUpperCase();
    if (code) {
      icd10Map.set(code, row);
      icd10Map.set(code.replace(".", ""), row);
    }
  }

  tariffMap = new Map();
  const tariffPath = getDataPath("GEMS_tariffs_2026.csv");
  if (fs.existsSync(tariffPath)) {
    const lines = fs.readFileSync(tariffPath, "utf-8").split("\n");
    const discs = ["014-GP", "016-ObGyn", "032-Paed"];
    for (let i = 3; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/"/g, ""));
      if (parts[0] && /^\d+$/.test(parts[0])) {
        const rates: Record<string, number> = {};
        discs.forEach((disc, ci) => {
          const val = parts[2 + ci * 2];
          if (val) {
            const num = parseFloat(val);
            if (!isNaN(num)) rates[disc] = num;
          }
        });
        tariffMap.set(parts[0], { code: parts[0], description: parts[1] || "", rates });
      }
    }
  }

  medicineMap = new Map();
  for (const row of loadCSV(getDataPath("medicine_prices.csv"))) {
    const nappi = (row.nappi_code || "").trim();
    const name = (row.name || "").trim();
    if (nappi) medicineMap.set(nappi, row);
    if (name) medicineMap.set(name.toUpperCase(), row);
  }

  rejectionMap = new Map();
  for (const row of loadCSV(getDataPath("rejection_codes.csv"))) {
    const code = (row.code || row.Code || "").trim();
    if (code) rejectionMap.set(code, row);
  }

  cdlMap = new Map();
  for (const row of loadCSV(getDataPath("cdl_conditions.csv"))) {
    const cond = (row.condition || row.Condition || "").trim();
    if (cond) cdlMap.set(cond.toUpperCase(), row);
  }

  ragDocs = [];
  const docsPath = path.join(process.cwd(), "ml/rag-index/documents.jsonl");
  if (fs.existsSync(docsPath)) {
    for (const line of fs.readFileSync(docsPath, "utf-8").split("\n")) {
      if (line.trim()) {
        try { ragDocs.push(JSON.parse(line)); } catch { /* skip */ }
      }
    }
  }

  console.log(`[RAG] ${icd10Map.size} ICD-10, ${tariffMap.size} tariffs, ${medicineMap.size} meds, ${ragDocs.length} docs`);
}

function exactLookup(query: string): string | null {
  ensureLoaded();
  const results: string[] = [];

  for (const code of query.toUpperCase().match(/\b[A-Z]\d{2}\.?\d{0,2}\b/g) || []) {
    const row = icd10Map!.get(code) || icd10Map!.get(code.replace(".", ""));
    if (row) results.push(`ICD-10-ZA ${code}: ${JSON.stringify(row)}`);
  }

  for (const code of query.match(/\b(\d{3,4})\b/g) || []) {
    const t = tariffMap!.get(code);
    if (t) {
      const rp = Object.entries(t.rates).map(([d, r]) => `${d}: R${r.toFixed(2)}`).join(", ");
      results.push(`CCSA Tariff ${code}: ${t.description.slice(0, 200)}. Rates: ${rp}`);
    }
  }

  for (const code of query.match(/\b(\d{7,10})\b/g) || []) {
    const row = medicineMap!.get(code);
    if (row) results.push(`NAPPI ${code}: ${JSON.stringify(row)}`);
  }

  return results.length > 0 ? results.join("\n\n") : null;
}

function keywordSearch(query: string, topK: number = 8): RAGDoc[] {
  ensureLoaded();
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return [];

  const scored: { doc: RAGDoc; score: number }[] = [];
  for (const doc of ragDocs!) {
    const lower = doc.text.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      score += (lower.match(new RegExp(escaped, "g")) || []).length;
    }
    if (score > 0) {
      score *= 1 + doc.metadata.priority / 20;
      scored.push({ doc, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.doc);
}

function decomposeQuery(query: string): string[] {
  const queries = [query];
  for (const m of query.toUpperCase().match(/\b[A-Z]\d{2}\.?\d{0,2}\b/g) || []) {
    queries.push(`ICD-10 code ${m}`);
  }
  for (const m of query.match(/\b(Discovery|GEMS|Bonitas|Momentum|Medshield|Bestmed|Medihelp)\b/gi) || []) {
    queries.push(`${m} medical scheme rules`);
  }
  if (/cdl|chronic/i.test(query)) queries.push("CDL chronic disease list");
  if (/pmb|prescribed minimum/i.test(query)) queries.push("prescribed minimum benefits");
  if (/reject/i.test(query)) queries.push("claims rejection reasons fixes");
  return [...new Set(queries)];
}

export function retrieve(query: string): { context: string; sources: Record<string, string[]> } {
  const sources: Record<string, string[]> = { exact: [], rag: [] };
  const parts: string[] = [];

  const exact = exactLookup(query);
  if (exact) {
    parts.push(`=== EXACT DATABASE LOOKUP ===\n${exact}`);
    sources.exact.push("database");
  }

  const subQueries = decomposeQuery(query);
  const seen = new Set<string>();
  const allResults: RAGDoc[] = [];

  for (const sq of subQueries.slice(0, 3)) {
    for (const doc of keywordSearch(sq, 8)) {
      const hash = doc.text.slice(0, 80);
      if (!seen.has(hash)) {
        seen.add(hash);
        allResults.push(doc);
        sources.rag.push(`${doc.metadata.category}:${doc.metadata.filename}`);
      }
    }
  }

  if (allResults.length > 0) {
    const ragText = allResults.slice(0, 8).map((r) => `[${r.metadata.category}]\n${r.text}`).join("\n\n---\n\n");
    parts.push(`=== KNOWLEDGE BASE ===\n${ragText}`);
  }

  let context = parts.join("\n\n");
  if (context.length > 6000) {
    if (exact) {
      const ep = `=== EXACT DATABASE LOOKUP ===\n${exact}`;
      context = ep + context.slice(ep.length, 6000);
    } else {
      context = context.slice(0, 6000);
    }
  }

  return { context, sources };
}

export function getStats() {
  ensureLoaded();
  return {
    icd10: icd10Map?.size || 0,
    tariffs: tariffMap?.size || 0,
    medicines: medicineMap?.size || 0,
    rejections: rejectionMap?.size || 0,
    cdl: cdlMap?.size || 0,
    rag_docs: ragDocs?.length || 0,
  };
}
