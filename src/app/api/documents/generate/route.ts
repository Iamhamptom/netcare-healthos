export const maxDuration = 60;
import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

/**
 * Document Generation API — auto-generates clinical documents from consultation data
 *
 * POST /api/documents/generate
 * Body: { type: "referral_letter" | "prescription" | "sick_note" | "saraa_motivation" | "clinical_notes", data: {...} }
 *
 * Generates professionally formatted documents using AI from structured consultation data.
 */

type DocType = "referral_letter" | "prescription" | "sick_note" | "saraa_motivation" | "clinical_notes";

interface GenerateRequest {
  type: DocType;
  data: {
    // Patient
    patientName?: string;
    patientDOB?: string;
    patientID?: string;
    patientGender?: string;
    patientPhone?: string;
    patientAddress?: string;
    medicalAid?: string;
    medicalAidNo?: string;

    // Doctor
    doctorName?: string;
    doctorQualifications?: string;
    doctorPracticeNo?: string;
    doctorHPCSA?: string;
    practiceName?: string;
    practiceAddress?: string;
    practicePhone?: string;

    // Consultation
    consultationDate?: string;
    chiefComplaint?: string;
    historyOfPresentingComplaint?: string;
    examinationFindings?: string;
    das28Score?: string;
    das28Interpretation?: string;
    tenderJointCount?: string;
    swollenJointCount?: string;
    esrOrCRP?: string;
    patientGlobalVAS?: string;

    // Diagnosis
    diagnosis?: string;
    icd10Code?: string;
    secondaryDiagnoses?: string;

    // Treatment
    medications?: Array<{ name: string; dose: string; frequency: string; duration?: string }>;
    managementPlan?: string;
    followUpDate?: string;
    referringDoctorName?: string;
    referringDoctorAddress?: string;

    // Sick note specific
    incapacityFrom?: string;
    incapacityTo?: string;
    incapacityReason?: string;

    // SARAA specific
    dmardHistory?: Array<{ drug: string; dose: string; duration: string; reason_stopped: string }>;
    tbScreening?: string;
    hivStatus?: string;
    hepBStatus?: string;
    proposedBiologic?: string;

    // Free text from scribe
    scribeTranscript?: string;
  };
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "documents/generate", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body: GenerateRequest = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "type and data required" }, { status: 400 });
    }

    const validTypes: DocType[] = ["referral_letter", "prescription", "sick_note", "saraa_motivation", "clinical_notes"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // Fallback to template-based generation (no AI)
      const doc = generateFromTemplate(type, data);
      return NextResponse.json({ document: doc, method: "template" });
    }

    // Use AI for polished document generation
    const prompt = buildPrompt(type, data);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
      }
    );

    const result = await res.json();
    const document = result?.candidates?.[0]?.content?.parts?.[0]?.text || generateFromTemplate(type, data);

    return NextResponse.json({ document, type, method: "ai" });
  } catch {
    return NextResponse.json({ error: "Document generation failed" }, { status: 500 });
  }
}

function buildPrompt(type: DocType, data: GenerateRequest["data"]): string {
  const base = `You are a medical document generator for a South African specialist practice. Generate a professional, properly formatted medical document. Use the exact data provided — do not fabricate any clinical information. Format in clean markdown.`;

  const patientBlock = `
Patient: ${data.patientName || "[Patient Name]"}
DOB: ${data.patientDOB || "[DOB]"} | ID: ${data.patientID || "[ID]"} | Gender: ${data.patientGender || "[Gender]"}
Medical Aid: ${data.medicalAid || "Private/Cash"} ${data.medicalAidNo ? `(${data.medicalAidNo})` : ""}`;

  const doctorBlock = `
Doctor: ${data.doctorName || "Dr. J. Ziki"}
Qualifications: ${data.doctorQualifications || "MBChB, FCP(SA), MMed, Cert Rheum(SA)"}
Practice No: ${data.doctorPracticeNo || "[Practice No]"} | HPCSA: ${data.doctorHPCSA || "[HPCSA No]"}
Practice: ${data.practiceName || "RheumCare Clinic Inc."}
Address: ${data.practiceAddress || "Wits Donald Gordon Medical Centre, Parktown, Johannesburg"}
Phone: ${data.practicePhone || "011 356 6317"}`;

  switch (type) {
    case "referral_letter":
      return `${base}

Generate a REFERRAL LETTER from a rheumatologist back to a referring GP.

${doctorBlock}
${patientBlock}

Referring Doctor: ${data.referringDoctorName || "[Referring GP]"}
Consultation Date: ${data.consultationDate || new Date().toLocaleDateString("en-ZA")}

Chief Complaint: ${data.chiefComplaint || "[Chief complaint]"}
History: ${data.historyOfPresentingComplaint || "[History]"}
Examination: ${data.examinationFindings || "[Examination findings]"}
${data.das28Score ? `DAS28 Score: ${data.das28Score} — ${data.das28Interpretation || ""}` : ""}
${data.tenderJointCount ? `Tender Joints: ${data.tenderJointCount}/28 | Swollen Joints: ${data.swollenJointCount || "0"}/28` : ""}

Diagnosis: ${data.diagnosis || "[Diagnosis]"} (${data.icd10Code || "[ICD-10]"})
${data.secondaryDiagnoses ? `Secondary: ${data.secondaryDiagnoses}` : ""}

Management Plan: ${data.managementPlan || "[Plan]"}
${data.medications?.length ? `Medications:\n${data.medications.map(m => `- ${m.name} ${m.dose} ${m.frequency}${m.duration ? ` for ${m.duration}` : ""}`).join("\n")}` : ""}

Follow-up: ${data.followUpDate || "[Follow-up date]"}

${data.scribeTranscript ? `\nAdditional context from consultation notes:\n${data.scribeTranscript.substring(0, 2000)}` : ""}

Format as a formal South African specialist referral letter with proper letterhead section, salutation, structured clinical content, and professional sign-off.`;

    case "prescription":
      return `${base}

Generate a PRESCRIPTION for a South African rheumatology patient.

${doctorBlock}
${patientBlock}

Date: ${data.consultationDate || new Date().toLocaleDateString("en-ZA")}
Diagnosis: ${data.diagnosis || "[Diagnosis]"} (${data.icd10Code || "[ICD-10]"})

Medications:
${data.medications?.map(m => `- ${m.name} ${m.dose} ${m.frequency}${m.duration ? ` for ${m.duration}` : ""}`).join("\n") || "[Medications to be specified]"}

Format as a proper South African prescription with: Rp. heading, numbered items, directions in English, quantity, repeats, doctor's signature line, dispensing instructions, and a warning section if methotrexate or biologics are included (pregnancy warning, blood monitoring requirements).`;

    case "sick_note":
      return `${base}

Generate a MEDICAL CERTIFICATE / SICK NOTE.

${doctorBlock}
${patientBlock}

Date of Examination: ${data.consultationDate || new Date().toLocaleDateString("en-ZA")}
Period of Incapacity: ${data.incapacityFrom || "[From]"} to ${data.incapacityTo || "[To]"}
Reason: ${data.incapacityReason || "Medical condition under treatment"}
Diagnosis: ${data.diagnosis || "[Diagnosis]"} (${data.icd10Code || "[ICD-10]"})

Format as a proper South African medical certificate per HPCSA guidelines. Include: practitioner details, patient details, date of examination, statement of incapacity, period, and a declaration that the practitioner personally examined the patient. DO NOT disclose the specific diagnosis unless the patient has consented — use "Medical condition under treatment" unless a specific diagnosis is provided.`;

    case "saraa_motivation":
      return `${base}

Generate a SARAA BIOLOGICS MOTIVATION LETTER for a South African patient needing biologic therapy.

${doctorBlock}
${patientBlock}

Diagnosis: ${data.diagnosis || "Rheumatoid Arthritis"} (${data.icd10Code || "M05.79"})
DAS28 Score: ${data.das28Score || "[Current DAS28]"} — ${data.das28Interpretation || "[Interpretation]"}
Tender Joints: ${data.tenderJointCount || "0"}/28 | Swollen Joints: ${data.swollenJointCount || "0"}/28
ESR/CRP: ${data.esrOrCRP || "[Value]"}
Patient Global VAS: ${data.patientGlobalVAS || "[0-100mm]"}

Previous DMARD History:
${data.dmardHistory?.map(d => `- ${d.drug} ${d.dose} for ${d.duration} — stopped due to: ${d.reason_stopped}`).join("\n") || "- Methotrexate [dose] for [duration] — [reason stopped]\n- [Second DMARD]"}

TB Screening: ${data.tbScreening || "[QuantiFERON/Mantoux result + Chest X-ray]"}
HIV Status: ${data.hivStatus || "[Result]"}
Hepatitis B: ${data.hepBStatus || "[HBsAg result]"}

Proposed Biologic: ${data.proposedBiologic || "[Agent name]"}

Format as a formal motivation letter to the SARAA Biologics Advisory Peer Review Panel. Include: patient demographics, disease history and duration, documented failure of conventional DMARDs (with doses, durations, and reasons for discontinuation), current disease activity (DAS28), screening results (TB, HIV, Hep B), proposed biologic agent with rationale, and a request for panel approval. Reference the SARAA 2024 guidelines.`;

    case "clinical_notes":
      return `${base}

Generate STRUCTURED CLINICAL NOTES from a rheumatology consultation.

${doctorBlock}
${patientBlock}

Date: ${data.consultationDate || new Date().toLocaleDateString("en-ZA")}

${data.scribeTranscript ? `Consultation transcript/scribe output:\n${data.scribeTranscript.substring(0, 3000)}` : ""}

Chief Complaint: ${data.chiefComplaint || "[From transcript]"}
History: ${data.historyOfPresentingComplaint || "[From transcript]"}
Examination: ${data.examinationFindings || "[From transcript]"}
${data.das28Score ? `DAS28: ${data.das28Score} (${data.das28Interpretation})` : ""}

Diagnosis: ${data.diagnosis || "[From transcript]"} (${data.icd10Code || "[ICD-10]"})
Plan: ${data.managementPlan || "[From transcript]"}

Format as structured clinical notes with SOAP format (Subjective, Objective, Assessment, Plan). Include ICD-10 codes inline. If scribe transcript is provided, extract all relevant clinical information from it.`;

    default:
      return `${base}\n\nGenerate a medical document with the following data:\n${JSON.stringify(data, null, 2)}`;
  }
}

function generateFromTemplate(type: DocType, data: GenerateRequest["data"]): string {
  const date = data.consultationDate || new Date().toLocaleDateString("en-ZA");
  const doctor = data.doctorName || "Dr. J. Ziki";
  const patient = data.patientName || "[Patient Name]";

  switch (type) {
    case "referral_letter":
      return `# Referral Letter\n\n**${data.practiceName || "RheumCare Clinic Inc."}**\n${data.practiceAddress || "Wits Donald Gordon Medical Centre, Parktown"}\nTel: ${data.practicePhone || "011 356 6317"}\n\n**Date**: ${date}\n\nDear ${data.referringDoctorName || "Doctor"},\n\n**Re: ${patient}** (DOB: ${data.patientDOB || "N/A"}, ID: ${data.patientID || "N/A"})\n\nThank you for referring this patient who presented with ${data.chiefComplaint || "[chief complaint]"}.\n\n**Examination**: ${data.examinationFindings || "[findings]"}\n${data.das28Score ? `**DAS28**: ${data.das28Score} (${data.das28Interpretation || ""})` : ""}\n\n**Diagnosis**: ${data.diagnosis || "[diagnosis]"} (${data.icd10Code || "[ICD-10]"})\n\n**Management Plan**:\n${data.managementPlan || "[plan]"}\n\n**Follow-up**: ${data.followUpDate || "[date]"}\n\nKind regards,\n${doctor}\n${data.doctorQualifications || "MBChB, FCP(SA), MMed, Cert Rheum(SA)"}`;

    case "prescription":
      return `# Prescription\n\n**${doctor}**\n${data.practiceAddress || "Wits Donald Gordon Medical Centre"}\nPractice No: ${data.doctorPracticeNo || "[No]"}\n\n**Patient**: ${patient}\n**Date**: ${date}\n\n**Rp.**\n${data.medications?.map((m, i) => `${i + 1}. ${m.name} ${m.dose}\n   Sig: ${m.frequency}${m.duration ? ` for ${m.duration}` : ""}`).join("\n\n") || "1. [Medication]"}\n\n---\nSignature: ____________________\n${doctor}`;

    case "sick_note":
      return `# Medical Certificate\n\n**${doctor}**\n${data.practiceAddress || "Wits Donald Gordon Medical Centre"}\nHPCSA: ${data.doctorHPCSA || "[No]"}\n\nI hereby certify that I personally examined **${patient}** (ID: ${data.patientID || "N/A"}) on **${date}** and found them to be medically unfit for duty from **${data.incapacityFrom || "[date]"}** to **${data.incapacityTo || "[date]"}** due to a medical condition under treatment.\n\nSignature: ____________________\nDate: ${date}`;

    case "saraa_motivation":
      return `# SARAA Biologics Motivation\n\n**To**: SARAA Biologics Advisory Peer Review Panel\n**From**: ${doctor}\n**Date**: ${date}\n**Patient**: ${patient}\n**Diagnosis**: ${data.diagnosis || "Rheumatoid Arthritis"} (${data.icd10Code || "M05.79"})\n**DAS28**: ${data.das28Score || "[Score]"}\n\n**DMARD History**:\n${data.dmardHistory?.map(d => `- ${d.drug} ${d.dose} for ${d.duration}: ${d.reason_stopped}`).join("\n") || "- [DMARD history]"}\n\n**Screening**: TB: ${data.tbScreening || "[result]"} | HIV: ${data.hivStatus || "[result]"} | HepB: ${data.hepBStatus || "[result]"}\n\n**Proposed Biologic**: ${data.proposedBiologic || "[Agent]"}\n\nI request panel approval for the above biologic therapy.\n\n${doctor}`;

    case "clinical_notes":
      return `# Clinical Notes\n\n**Patient**: ${patient} | **Date**: ${date} | **Doctor**: ${doctor}\n\n**S (Subjective)**: ${data.chiefComplaint || "[Chief complaint]"}\n${data.historyOfPresentingComplaint || ""}\n\n**O (Objective)**: ${data.examinationFindings || "[Examination]"}\n${data.das28Score ? `DAS28: ${data.das28Score} (${data.das28Interpretation || ""})` : ""}\n\n**A (Assessment)**: ${data.diagnosis || "[Diagnosis]"} (${data.icd10Code || "[ICD-10]"})\n\n**P (Plan)**:\n${data.managementPlan || "[Management plan]"}\nFollow-up: ${data.followUpDate || "[Date]"}`;

    default:
      return "Document type not supported.";
  }
}
