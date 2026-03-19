// ICD-10 / CDT Dental + Common Medical Procedure Codes
// Searchable by code or description

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

export const ICD10_CODES: ICD10Code[] = [
  // ─── Dental Diagnostic ───
  { code: "D0120", description: "Periodic oral evaluation — established patient", category: "diagnostic" },
  { code: "D0140", description: "Limited oral evaluation — problem focused", category: "diagnostic" },
  { code: "D0150", description: "Comprehensive oral evaluation — new or established patient", category: "diagnostic" },
  { code: "D0180", description: "Comprehensive periodontal evaluation — new or established patient", category: "diagnostic" },
  { code: "D0210", description: "Intraoral — complete series of radiographic images", category: "diagnostic" },
  { code: "D0220", description: "Intraoral — periapical first radiographic image", category: "diagnostic" },
  { code: "D0230", description: "Intraoral — periapical each additional radiographic image", category: "diagnostic" },
  { code: "D0270", description: "Bitewing — single radiographic image", category: "diagnostic" },
  { code: "D0272", description: "Bitewings — two radiographic images", category: "diagnostic" },
  { code: "D0274", description: "Bitewings — four radiographic images", category: "diagnostic" },
  { code: "D0330", description: "Panoramic radiographic image", category: "diagnostic" },
  { code: "D0340", description: "2D cephalometric radiographic image", category: "diagnostic" },

  // ─── Preventive ───
  { code: "D1110", description: "Prophylaxis — adult (cleaning)", category: "preventive" },
  { code: "D1120", description: "Prophylaxis — child (cleaning)", category: "preventive" },
  { code: "D1206", description: "Topical application of fluoride varnish", category: "preventive" },
  { code: "D1208", description: "Topical application of fluoride", category: "preventive" },
  { code: "D1351", description: "Sealant — per tooth", category: "preventive" },
  { code: "D1510", description: "Space maintainer — fixed, unilateral", category: "preventive" },

  // ─── Restorative ───
  { code: "D2140", description: "Amalgam — one surface, primary or permanent", category: "restorative" },
  { code: "D2150", description: "Amalgam — two surfaces, primary or permanent", category: "restorative" },
  { code: "D2160", description: "Amalgam — three surfaces, primary or permanent", category: "restorative" },
  { code: "D2330", description: "Resin-based composite — one surface, anterior", category: "restorative" },
  { code: "D2331", description: "Resin-based composite — two surfaces, anterior", category: "restorative" },
  { code: "D2332", description: "Resin-based composite — three surfaces, anterior", category: "restorative" },
  { code: "D2391", description: "Resin-based composite — one surface, posterior", category: "restorative" },
  { code: "D2392", description: "Resin-based composite — two surfaces, posterior", category: "restorative" },
  { code: "D2393", description: "Resin-based composite — three surfaces, posterior", category: "restorative" },
  { code: "D2740", description: "Crown — porcelain/ceramic substrate", category: "restorative" },
  { code: "D2750", description: "Crown — porcelain fused to high noble metal", category: "restorative" },
  { code: "D2751", description: "Crown — porcelain fused to predominantly base metal", category: "restorative" },

  // ─── Endodontics ───
  { code: "D3220", description: "Therapeutic pulpotomy", category: "endodontics" },
  { code: "D3310", description: "Root canal — anterior tooth (excluding final restoration)", category: "endodontics" },
  { code: "D3320", description: "Root canal — premolar tooth (excluding final restoration)", category: "endodontics" },
  { code: "D3330", description: "Root canal — molar tooth (excluding final restoration)", category: "endodontics" },

  // ─── Periodontics ───
  { code: "D4341", description: "Periodontal scaling and root planing — four or more teeth per quadrant", category: "periodontics" },
  { code: "D4342", description: "Periodontal scaling and root planing — one to three teeth per quadrant", category: "periodontics" },
  { code: "D4355", description: "Full mouth debridement", category: "periodontics" },
  { code: "D4910", description: "Periodontal maintenance", category: "periodontics" },

  // ─── Prosthodontics ───
  { code: "D5110", description: "Complete denture — maxillary", category: "prosthodontics" },
  { code: "D5120", description: "Complete denture — mandibular", category: "prosthodontics" },
  { code: "D5213", description: "Maxillary partial denture — cast metal framework", category: "prosthodontics" },
  { code: "D5214", description: "Mandibular partial denture — cast metal framework", category: "prosthodontics" },
  { code: "D6010", description: "Endosseous implant — surgical placement", category: "prosthodontics" },
  { code: "D6058", description: "Abutment supported porcelain/ceramic crown", category: "prosthodontics" },

  // ─── Oral Surgery ───
  { code: "D7140", description: "Extraction, erupted tooth or exposed root", category: "oral_surgery" },
  { code: "D7210", description: "Extraction — surgical, erupted tooth", category: "oral_surgery" },
  { code: "D7220", description: "Extraction — soft tissue impacted tooth", category: "oral_surgery" },
  { code: "D7230", description: "Extraction — partially bony impacted tooth", category: "oral_surgery" },
  { code: "D7240", description: "Extraction — completely bony impacted tooth", category: "oral_surgery" },
  { code: "D7510", description: "Incision and drainage of abscess — intraoral soft tissue", category: "oral_surgery" },

  // ─── Orthodontics ───
  { code: "D8080", description: "Comprehensive orthodontic treatment — adolescent dentition", category: "orthodontics" },
  { code: "D8090", description: "Comprehensive orthodontic treatment — adult dentition", category: "orthodontics" },

  // ─── Adjunctive ───
  { code: "D9110", description: "Palliative treatment of dental pain — minor procedure", category: "adjunctive" },
  { code: "D9215", description: "Local anaesthesia in conjunction with operative or surgical procedures", category: "adjunctive" },
  { code: "D9230", description: "Inhalation of nitrous oxide / anxiolysis", category: "adjunctive" },
  { code: "D9310", description: "Consultation — diagnostic service", category: "adjunctive" },
  { code: "D9440", description: "Office visit — after regularly scheduled hours", category: "adjunctive" },
  { code: "D9986", description: "Missed appointment", category: "adjunctive" },

  // ─── Whitening ───
  { code: "D9972", description: "External bleaching — per arch (in-office)", category: "whitening" },
  { code: "D9975", description: "External bleaching — per arch (home application)", category: "whitening" },

  // ─── GP / Medical Consultation Codes ───
  { code: "0190", description: "Consultation — general practitioner", category: "consultation" },
  { code: "0191", description: "Follow-up consultation — GP", category: "consultation" },
  { code: "0192", description: "Extended consultation — GP (>30 min)", category: "consultation" },
  { code: "0290", description: "Consultation — specialist", category: "consultation" },
  { code: "0193", description: "Telephonic consultation — GP", category: "consultation" },
  { code: "0194", description: "Home visit consultation", category: "consultation" },

  // ─── Common ICD-10 Diagnosis Codes ───
  { code: "K02.1", description: "Dental caries — dentine", category: "diagnosis" },
  { code: "K02.3", description: "Arrested dental caries", category: "diagnosis" },
  { code: "K04.0", description: "Pulpitis", category: "diagnosis" },
  { code: "K04.7", description: "Periapical abscess without sinus", category: "diagnosis" },
  { code: "K05.0", description: "Acute gingivitis", category: "diagnosis" },
  { code: "K05.1", description: "Chronic gingivitis", category: "diagnosis" },
  { code: "K05.3", description: "Chronic periodontitis", category: "diagnosis" },
  { code: "K08.1", description: "Loss of teeth due to accident, extraction or local periodontal disease", category: "diagnosis" },
  { code: "K01.1", description: "Impacted teeth", category: "diagnosis" },
  { code: "K03.1", description: "Abrasion of teeth", category: "diagnosis" },
  { code: "K12.0", description: "Recurrent oral aphthae (mouth ulcers)", category: "diagnosis" },
  { code: "K13.7", description: "Other and unspecified lesions of oral mucosa", category: "diagnosis" },
  { code: "S02.5", description: "Fracture of tooth", category: "diagnosis" },
  { code: "K07.3", description: "Anomalies of tooth position (crowding/spacing)", category: "diagnosis" },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified", category: "diagnosis" },
  { code: "R50.9", description: "Fever, unspecified", category: "diagnosis" },
  { code: "M54.5", description: "Low back pain", category: "diagnosis" },
  { code: "J20.9", description: "Acute bronchitis, unspecified", category: "diagnosis" },
  { code: "I10", description: "Essential (primary) hypertension", category: "diagnosis" },
  { code: "E11", description: "Type 2 diabetes mellitus", category: "diagnosis" },
  { code: "Z00.0", description: "General adult medical examination", category: "diagnosis" },
];

export function searchICD10(query: string, limit = 20): ICD10Code[] {
  const q = query.toLowerCase().trim();
  if (!q) return ICD10_CODES.slice(0, limit);

  return ICD10_CODES
    .filter(c => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    .slice(0, limit);
}
