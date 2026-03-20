// AI Clinical Notes → Full Claim Auto-fill
// Uses Gemini to extract structured claim data from free-text clinical notes
// Maps to ICD-10-ZA codes, CPT/CCSA codes, and SA tariff amounts

import { COMMON_ICD10, COMMON_CPT, isValidICD10, isValidCPT } from "./codes";
import { isPMBCondition, isCDLCondition } from "./pmb";

export interface AutofilledClaim {
  patientName: string;
  dateOfService: string;
  lineItems: { icd10Code: string; cptCode: string; description: string; amount: number }[];
  clinicalSummary: string;
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

const AUTOFILL_PROMPT = `You are a South African medical claims auto-fill engine. Given free-text clinical notes from a GP or specialist consultation, extract structured claim data.

YOUR TASK:
1. Extract the patient name (if mentioned)
2. Extract the date of service (if mentioned, else use "today")
3. Identify ALL diagnoses and map to ICD-10-ZA codes (maximum specificity — use 4th/5th character)
4. Identify ALL procedures performed and map to CPT/CCSA codes (4-digit)
5. Estimate amounts in ZAR cents based on 2026 SA tariffs
6. Write a brief clinical summary

COMMON SA CPT CODES & 2026 TARIFFS (in cents):
- 0190: GP consultation — R520 (52000 cents)
- 0191: GP follow-up — R360 (36000 cents)
- 0192: Telephonic consultation — R260 (26000 cents)
- 0193: Extended consultation (>30 min) — R780 (78000 cents)
- 0141: Specialist consultation — R950 (95000 cents)
- 0290: After-hours consultation — R780 (78000 cents)
- 0308: ECG recording & interpretation — R350 (35000 cents)
- 0312: Spirometry — R280 (28000 cents)
- 0382: Blood glucose POC — R65 (6500 cents)
- 0400: Wound suturing (simple) — R420 (42000 cents)
- 0410: Incision & drainage — R480 (48000 cents)
- 1101: IM injection — R120 (12000 cents)
- 1102: IV injection — R180 (18000 cents)
- 8101: Dental examination — R380 (38000 cents)
- 8201: Scale & polish — R560 (56000 cents)
- 8501: Amalgam filling (1 surface) — R480 (48000 cents)
- 8701: Extraction (simple) — R450 (45000 cents)

RULES:
- Amount MUST be in ZAR cents (e.g., R520 = 52000)
- Always use ICD-10-ZA with maximum specificity
- If multiple conditions/procedures, create multiple line items
- Each line item should have exactly ONE ICD-10 and ONE CPT code
- If medication was prescribed, note it in the summary but don't add a CPT line for prescribing

Respond in JSON format ONLY:
{
  "patientName": "John Smith",
  "dateOfService": "2026-03-20",
  "lineItems": [
    {"icd10Code": "I10", "cptCode": "0190", "description": "GP consultation — essential hypertension", "amount": 52000}
  ],
  "clinicalSummary": "Patient presented with elevated BP 160/100...",
  "confidence": "high",
  "warnings": ["Verify patient membership details before submission"]
}`;

/** Auto-fill a complete claim from free-text clinical notes using Gemini */
export async function autofillClaimFromNotes(clinicalNotes: string): Promise<AutofilledClaim> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackAutofill(clinicalNotes);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${AUTOFILL_PROMPT}\n\nClinical Notes:\n${clinicalNotes}`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 3000,
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackAutofill(clinicalNotes);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      patientName?: string;
      dateOfService?: string;
      lineItems?: { icd10Code: string; cptCode: string; description: string; amount: number }[];
      clinicalSummary?: string;
      confidence?: string;
      warnings?: string[];
    };

    // Validate and enrich
    const warnings = [...(parsed.warnings || [])];
    const lineItems = (parsed.lineItems || []).map((li) => {
      // Validate ICD-10 format
      if (!isValidICD10(li.icd10Code)) {
        warnings.push(`ICD-10 code "${li.icd10Code}" may have invalid format — verify before submission`);
      }
      // Validate CPT format
      if (!isValidCPT(li.cptCode)) {
        warnings.push(`CPT code "${li.cptCode}" may have invalid format — verify before submission`);
      }
      // Check if amount is reasonable (not zero, not absurdly high)
      if (li.amount <= 0) {
        const tariff = COMMON_CPT[li.cptCode];
        li.amount = tariff ? tariff.tariff2026 : 52000;
        warnings.push(`Amount for CPT ${li.cptCode} was missing — defaulted to tariff rate`);
      }
      // Flag PMB conditions
      if (isPMBCondition(li.icd10Code)) {
        warnings.push(`${li.icd10Code} is a PMB condition — scheme MUST cover. Ensure PMB protocol is followed.`);
      }
      // Flag CDL conditions
      const cdl = isCDLCondition(li.icd10Code);
      if (cdl.found) {
        warnings.push(`${li.icd10Code} (${cdl.condition}) is a CDL condition — ensure chronic authorization is in place`);
      }
      return {
        icd10Code: li.icd10Code,
        cptCode: li.cptCode,
        description: li.description || "",
        amount: li.amount,
      };
    });

    if (lineItems.length === 0) {
      return fallbackAutofill(clinicalNotes);
    }

    return {
      patientName: parsed.patientName || "",
      dateOfService: parsed.dateOfService || new Date().toISOString().split("T")[0],
      lineItems,
      clinicalSummary: parsed.clinicalSummary || "",
      confidence: (parsed.confidence as "high" | "medium" | "low") || "medium",
      warnings,
    };
  } catch (err) {
    console.error("AI autofill error:", err);
    return fallbackAutofill(clinicalNotes);
  }
}

/** Keyword-based fallback when Gemini is unavailable */
function fallbackAutofill(notes: string): AutofilledClaim {
  const lower = notes.toLowerCase();
  const lineItems: AutofilledClaim["lineItems"] = [];
  const warnings: string[] = ["Using keyword-based extraction — connect Gemini API for AI-powered accuracy"];

  // Extract patient name (heuristic: look for "patient: Name" or "Pt: Name")
  const nameMatch = notes.match(/(?:patient|pt|name)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i);
  const patientName = nameMatch ? nameMatch[1] : "";

  // Extract date (look for YYYY-MM-DD or DD/MM/YYYY)
  const dateMatch = notes.match(/(\d{4}-\d{2}-\d{2})/);
  const dateMatch2 = notes.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  let dateOfService = new Date().toISOString().split("T")[0];
  if (dateMatch) {
    dateOfService = dateMatch[1];
  } else if (dateMatch2) {
    const parts = dateMatch2[1].split("/");
    dateOfService = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }

  // Condition-to-code mapping
  const conditionMap: { terms: string[]; icd10: string; desc: string }[] = [
    { terms: ["hypertension", "high blood pressure", "bp elevated", "bp 1"], icd10: "I10", desc: "Essential hypertension" },
    { terms: ["diabetes", "diabetic", "blood sugar", "glucose high", "hba1c"], icd10: "E11.9", desc: "Type 2 diabetes mellitus" },
    { terms: ["asthma", "wheeze", "wheezing", "bronchospasm"], icd10: "J45.9", desc: "Asthma" },
    { terms: ["upper respiratory", "urti", "sore throat", "pharyngitis"], icd10: "J06.9", desc: "Acute upper respiratory infection" },
    { terms: ["bronchitis", "chest infection", "productive cough"], icd10: "J20.9", desc: "Acute bronchitis" },
    { terms: ["sinusitis", "sinus"], icd10: "J32.9", desc: "Chronic sinusitis" },
    { terms: ["urinary tract", "uti", "dysuria", "burning urine"], icd10: "N39.0", desc: "Urinary tract infection" },
    { terms: ["back pain", "lower back", "lumbar", "lumbago"], icd10: "M54.5", desc: "Low back pain" },
    { terms: ["gastritis", "epigastric", "heartburn", "reflux"], icd10: "K29.7", desc: "Gastritis" },
    { terms: ["headache", "cephalgia", "migraine"], icd10: "R51", desc: "Headache" },
    { terms: ["fever", "pyrexia", "temperature"], icd10: "R50.9", desc: "Fever" },
    { terms: ["cholesterol", "lipid", "hyperlipid"], icd10: "E78.5", desc: "Hyperlipidaemia" },
    { terms: ["otitis", "ear infection", "ear pain"], icd10: "H66.9", desc: "Otitis media" },
    { terms: ["dermatitis", "eczema", "rash"], icd10: "L30.9", desc: "Dermatitis" },
    { terms: ["dental", "tooth", "caries", "cavity"], icd10: "K02.9", desc: "Dental caries" },
    { terms: ["immunization", "vaccination", "vaccine"], icd10: "Z23", desc: "Immunization" },
    { terms: ["check-up", "checkup", "routine", "wellness", "general exam"], icd10: "Z00.0", desc: "General examination" },
  ];

  // Detect conditions
  const detectedICD10s: { code: string; desc: string }[] = [];
  for (const cond of conditionMap) {
    if (cond.terms.some((t) => lower.includes(t))) {
      detectedICD10s.push({ code: cond.icd10, desc: cond.desc });
    }
  }
  if (detectedICD10s.length === 0) {
    detectedICD10s.push({ code: "Z00.0", desc: "General examination" });
    warnings.push("No specific condition detected — defaulting to general examination");
  }

  // Detect procedure type
  let cptCode = "0190";
  let cptDesc = "GP consultation";
  let cptAmount = 52000;

  if (lower.includes("follow") || lower.includes("review")) {
    cptCode = "0191"; cptDesc = "GP follow-up consultation"; cptAmount = 36000;
  } else if (lower.includes("extended") || lower.includes(">30 min") || lower.includes("30 min")) {
    cptCode = "0193"; cptDesc = "GP extended consultation"; cptAmount = 78000;
  } else if (lower.includes("telephonic") || lower.includes("phone call") || lower.includes("telehealth")) {
    cptCode = "0192"; cptDesc = "GP telephonic consultation"; cptAmount = 26000;
  } else if (lower.includes("specialist") || lower.includes("referral")) {
    cptCode = "0141"; cptDesc = "Specialist consultation"; cptAmount = 95000;
  } else if (lower.includes("after-hours") || lower.includes("after hours")) {
    cptCode = "0290"; cptDesc = "After-hours consultation"; cptAmount = 78000;
  }

  // Create line items — one per diagnosis, all using the same CPT
  for (const diag of detectedICD10s) {
    lineItems.push({
      icd10Code: diag.code,
      cptCode,
      description: `${cptDesc} — ${diag.desc}`,
      amount: cptAmount,
    });
    // Only use the consultation CPT for the first item
    // Subsequent items are diagnosis-only (no separate procedure fee)
    if (detectedICD10s.indexOf(diag) === 0) continue;
  }

  // Detect additional procedures
  if (lower.includes("ecg") || lower.includes("electrocardiog")) {
    lineItems.push({ icd10Code: detectedICD10s[0].code, cptCode: "0308", description: "ECG recording & interpretation", amount: 35000 });
  }
  if (lower.includes("spirometry") || lower.includes("lung function")) {
    lineItems.push({ icd10Code: detectedICD10s[0].code, cptCode: "0312", description: "Spirometry", amount: 28000 });
  }
  if (lower.includes("blood glucose") || lower.includes("finger prick") || lower.includes("glucometer")) {
    lineItems.push({ icd10Code: detectedICD10s[0].code, cptCode: "0382", description: "Blood glucose (point-of-care)", amount: 6500 });
  }
  if (lower.includes("sutur") || lower.includes("stitch")) {
    lineItems.push({ icd10Code: detectedICD10s[0].code, cptCode: "0400", description: "Wound suturing (simple)", amount: 42000 });
  }
  if (lower.includes("injection") || lower.includes("im ") || lower.includes("intramuscular")) {
    lineItems.push({ icd10Code: detectedICD10s[0].code, cptCode: "1101", description: "Intramuscular injection", amount: 12000 });
  }
  if (lower.includes("incision") || lower.includes("drain") || lower.includes("abscess")) {
    lineItems.push({ icd10Code: detectedICD10s[0].code, cptCode: "0410", description: "Incision & drainage (abscess)", amount: 48000 });
  }

  // Build summary
  const diagList = detectedICD10s.map((d) => `${d.desc} (${d.code})`).join(", ");
  const clinicalSummary = `Keyword extraction from clinical notes. Diagnoses detected: ${diagList}. Primary procedure: ${cptDesc}.`;

  return {
    patientName,
    dateOfService,
    lineItems,
    clinicalSummary,
    confidence: "low",
    warnings,
  };
}
