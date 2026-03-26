# SA Healthcare IT Competitor Landscape — March 2026

## The Gap We Fill
Nobody in SA does: Note → SOAP → ICD-10 → Claim Validation → Submission
- Healthbridge Nora: speech-to-SOAP only (no ICD-10 coding, no claims)
- GoodX GoodXpert: prompt-based notes (no ambient, no claims)
- Heidi Health: expanding to SA but zero medical aid integration
- CareOn: hospital-only (not GP)

## Key Stats
- 22,000+ independent GP practices in SA — unserved by AI clinical docs
- 30% of claim rejections from incorrect ICD-10 coding
- 70% of GPs code from memory (15-20 codes for everything)
- 0% of PMS in SA suggest ICD-10 from clinical notes using AI
- R13B+ annual waste from coding errors

## Competitor Matrix
| Product | Notes | ICD-10 AI | Claims | SA Market |
|---------|-------|-----------|--------|-----------|
| Healthbridge Nora | Speech-to-SOAP | No | No | 265 clinicians |
| GoodX GoodXpert | Prompt-based | No | No | Unknown |
| Heidi Health | Ambient listen | No | No | Expanding |
| CareOn (Netcare) | iPad EMR | No | Hospital only | 34K users |
| **Netcare Health OS** | **All 3 methods** | **Yes (Gemini)** | **Full pipeline** | **Live** |

## CareOn Bridge
- CareOn = hospital EMR (iMedOne, Deutsche Telekom)
- NOT available to GPs or Medicross clinics
- Our Bridge: HL7v2 → FHIR R4 → AI billing advisory (read-only)
- 26+ hospitals, 34K clinical staff
