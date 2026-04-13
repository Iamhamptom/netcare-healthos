/**
 * VisioCode Shared Brain — Client Library
 *
 * Drop this file into any VisioCorp health product (Doctor OS, Claims Analyzer,
 * Patient Flow AI, etc.) to access the shared medical intelligence API.
 *
 * Usage:
 *   import { VisioCodeBrain } from "@/lib/shared-brain";
 *   const brain = new VisioCodeBrain("https://visiocode.vercel.app", process.env.VISIOCODE_API_KEY!);
 *   const codes = await brain.lookupICD10("diabetes");
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Code {
  code: string;
  description: string;
  chapter: number;
  pmb: boolean;
  cdl: boolean;
  gender: "M" | "F" | null;
  valid_primary: boolean;
}

export interface PairViolation {
  pair: [string, string];
  type: string;
  reason: string;
}

export interface ECCResult {
  valid: boolean;
  missing: string[];
  message: string;
}

export interface ValidationResult {
  codes: string[];
  system: string;
  valid: boolean;
  pair_violations: PairViolation[];
  external_cause: ECCResult;
}

export interface SchemeResult {
  icd10_codes: string[];
  tariff_codes: string[];
  scheme: string;
  compatible: boolean;
  warnings: string[];
  pre_auth_needed: boolean;
  rejection_risk: number;
}

export interface KnowledgeEntry {
  title: string;
  category: string;
  source: string;
  content: string;
}

export interface KnowledgeResult {
  query: string;
  category: string | null;
  count: number;
  results: KnowledgeEntry[];
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class VisioCodeBrain {
  private baseUrl: string;
  private apiKey: string;
  private productId: string;

  constructor(apiUrl: string, apiKey: string, productId: string = "unknown") {
    this.baseUrl = apiUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.productId = productId;
  }

  private async request<T>(params: Record<string, string>): Promise<T> {
    const qs = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/api/v1/shared?${qs}`;

    const res = await fetch(url, {
      headers: {
        "x-api-key": this.apiKey,
        "x-product-id": this.productId,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || `Shared Brain API error: ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  /** Search ICD-10 codes by keyword or code prefix */
  async lookupICD10(query: string, system: string = "icd10_za", limit: number = 20): Promise<Code[]> {
    const data = await this.request<{ results: Code[] }>({
      action: "lookup",
      q: query,
      type: "icd10",
      system,
      limit: String(limit),
    });
    return data.results;
  }

  /** Validate a set of ICD-10 codes for pair violations and external cause requirements */
  async validateCodes(codes: string[], system: string = "icd10_za"): Promise<ValidationResult> {
    return this.request<ValidationResult>({
      action: "validate",
      codes: codes.join(","),
      system,
    });
  }

  /** Check if injury codes have the required external cause codes (V-Y) */
  async checkExternalCause(codes: string[], system: string = "icd10_za"): Promise<ECCResult> {
    const data = await this.request<{ valid: boolean; missing: string[]; message: string }>({
      action: "check_ecc",
      codes: codes.join(","),
      system,
    });
    return data;
  }

  /** Check scheme compatibility, pre-auth requirements, and rejection risk */
  async checkScheme(codes: string[], tariffs: string[], scheme: string): Promise<SchemeResult> {
    return this.request<SchemeResult>({
      action: "scheme",
      codes: codes.join(","),
      tariffs: tariffs.join(","),
      scheme,
    });
  }

  /** Search the health knowledge base (PMB rules, scheme policies, clinical guidelines) */
  async searchKnowledge(query: string, category?: string, limit: number = 5): Promise<KnowledgeResult> {
    const params: Record<string, string> = {
      action: "knowledge",
      q: query,
      limit: String(limit),
    };
    if (category) params.category = category;
    return this.request<KnowledgeResult>(params);
  }
}
