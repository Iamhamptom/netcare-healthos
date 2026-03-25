export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface ICD10Suggestion {
  code: string;
  description: string;
  confidence: number;
}

export interface VoiceCommand {
  type: "add_plan" | "add_assessment" | "add_diagnosis" | "prescribe" | "refer" | "add_note";
  content: string;
  timestamp: number;
  applied: boolean;
}

export interface TranscriptSegment {
  text: string;
  timestamp: number;
  speaker?: "doctor" | "patient" | "unknown";
}

export interface ScribeAnalysis {
  soap: SOAPNote;
  icd10Codes: ICD10Suggestion[];
  redFlags: string[];
  chiefComplaint: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  allergies: Array<{ name: string; severity: string; reaction: string }>;
  vitalsMentioned: Record<string, number | null>;
}
