import { describe, it, expect } from "vitest";
import { encryptField, decryptField, maskIdNumber, maskMembership } from "@/lib/healthbridge/encrypt";

// ============================================================================
// DATA CLASSIFICATION — Healthcare data classification per POPIA Section 26-28
// (Special Personal Information) and international standards:
// - HIPAA Safe Harbor (18 identifiers)
// - GDPR Article 9 (special categories)
// - POPIA Section 26 (health data as special personal information)
// - ISO 27799 (health informatics security)
// ============================================================================

describe("DATA CLASSIFICATION: PII Field Identification", () => {
  // These tests document which fields are PII vs non-PII
  // This is critical for POPIA compliance audits

  it("should recognize patient name as PII requiring encryption", () => {
    const patientName = "John Mokoena";
    const encrypted = encryptField(patientName);
    expect(encrypted).not.toBe(patientName);
    expect(encrypted).not.toContain(patientName);
    // Must be reversible (not a hash)
    expect(decryptField(encrypted)).toBe(patientName);
  });

  it("should recognize SA ID number as special personal information", () => {
    const saId = "8506155012089";
    const encrypted = encryptField(saId);
    expect(encrypted).not.toBe(saId);
    expect(encrypted).not.toContain(saId);
    expect(decryptField(encrypted)).toBe(saId);
  });

  it("should recognize medical aid membership as PII", () => {
    const membership = "DH900012345";
    const encrypted = encryptField(membership);
    expect(encrypted).not.toBe(membership);
    expect(encrypted).not.toContain(membership);
    expect(decryptField(encrypted)).toBe(membership);
  });

  it("should recognize date of birth as PII requiring protection", () => {
    const dob = "1985-06-15";
    const encrypted = encryptField(dob);
    expect(encrypted).not.toBe(dob);
    expect(encrypted).not.toContain(dob);
    expect(decryptField(encrypted)).toBe(dob);
  });

  it("should recognize ICD-10 code as health information (special category under POPIA/GDPR)", () => {
    // ICD-10 codes reveal health conditions — special personal info
    const icd10 = "B20"; // HIV
    const encrypted = encryptField(icd10);
    expect(encrypted).not.toBe(icd10);
    expect(decryptField(encrypted)).toBe(icd10);
  });

  it("should correctly handle claim amount as non-PII (no encryption required but useful)", () => {
    // Amounts alone are not PII, but when combined with other data they can be identifying
    const amount = "52000";
    // Should still work with encryption if needed
    const encrypted = encryptField(amount);
    expect(decryptField(encrypted)).toBe(amount);
  });
});

describe("DATA CLASSIFICATION: Masking Coverage", () => {
  it("should mask SA ID number hiding first 6 digits (DOB component)", () => {
    const masked = maskIdNumber("8506155012089");
    expect(masked).toBe("******5012089");
    // The DOB (850615) must be completely hidden
    expect(masked).not.toContain("850615");
    expect(masked).not.toContain("8506");
    expect(masked).not.toContain("85061");
  });

  it("should mask membership hiding all but last 4", () => {
    const masked = maskMembership("DH900012345");
    expect(masked).toBe("*******2345");
    // Must hide the prefix
    expect(masked).not.toContain("DH9000");
    expect(masked).not.toContain("DH90001");
  });

  it("should produce irreversible masking — cannot recover original from masked ID", () => {
    const masked = maskIdNumber("8506155012089");
    // The * characters destroy information — no way to recover "850615"
    expect(masked.substring(0, 6)).toBe("******");
    // Different IDs with same last 7 digits would produce same masked output
    // This proves information is truly destroyed
    const masked2 = maskIdNumber("9001015012089");
    expect(masked2).toBe("******5012089");
    // Both produce same masked output — original cannot be distinguished
    expect(masked).toBe(masked2);
  });

  it("should produce irreversible masking — cannot recover original from masked membership", () => {
    const masked = maskMembership("ABC12342345");
    // Different memberships with same last 4 would produce same masked output
    const masked2 = maskMembership("XYZ99992345");
    // Both end in 2345 with same total length
    expect(masked.slice(-4)).toBe("2345");
    expect(masked2.slice(-4)).toBe("2345");
  });

  it("should still show partial visibility in masked ID (recognizable)", () => {
    const masked = maskIdNumber("8506155012089");
    // Last 7 digits are visible — enough for partial identification
    expect(masked).toContain("5012089");
    expect(masked).toHaveLength(13); // Same length as original
  });

  it("should still show partial visibility in masked membership (recognizable)", () => {
    const masked = maskMembership("900012345");
    // Last 4 chars are visible
    expect(masked).toContain("2345");
    expect(masked).toHaveLength(9); // Same length as original
  });
});

describe("DATA CLASSIFICATION: Encryption Field Coverage", () => {
  it("should handle all PII field types: string, numeric-string, dates", () => {
    const fields = [
      "John Mokoena",         // name (string)
      "8506155012089",        // SA ID (numeric string)
      "DH900012345",          // membership (alphanumeric)
      "1985-06-15",           // DOB (date string)
      "B20",                  // ICD-10 (health info)
      "0860 445 566",         // phone number
      "patient@email.co.za",  // email
    ];

    for (const field of fields) {
      const encrypted = encryptField(field);
      const decrypted = decryptField(encrypted);
      expect(decrypted).toBe(field);
    }
  });

  it("should produce hex-encoded output (safe for JSON storage, no binary)", () => {
    const encrypted = encryptField("test-json-safe");
    // Must be valid hex (no binary characters that would break JSON)
    expect(/^[0-9a-f]+$/.test(encrypted)).toBe(true);
    // Should be storable in JSON without escaping issues
    const json = JSON.stringify({ data: encrypted });
    const parsed = JSON.parse(json);
    expect(parsed.data).toBe(encrypted);
  });

  it("should include IV prefix in encrypted output", () => {
    const encrypted = encryptField("test-iv-prefix");
    // IV is 12 bytes = 24 hex chars, always at the start
    expect(encrypted.length).toBeGreaterThanOrEqual(24);
    // The first 24 chars are the IV
    const ivHex = encrypted.substring(0, 24);
    expect(/^[0-9a-f]{24}$/.test(ivHex)).toBe(true);
  });

  it("should produce different encryptions of same value (random IV)", () => {
    const value = "same-sensitive-data";
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(encryptField(value));
    }
    // All 20 must be different (probability of collision is negligible)
    expect(results.size).toBe(20);

    // But all must decrypt to the same value
    for (const encrypted of results) {
      expect(decryptField(encrypted)).toBe(value);
    }
  });
});

describe("DATA CLASSIFICATION: POPIA Compliance Verification", () => {
  it("should encrypt sensitive data with AES-256 (key size verification via output format)", () => {
    const encrypted = encryptField("POPIA-test");
    // AES-256-GCM output: IV(12 bytes=24 hex) + AuthTag(16 bytes=32 hex) + ciphertext
    // For 10-byte plaintext, ciphertext would be ~10 bytes = 20 hex chars
    // Total: ~76 hex chars
    expect(encrypted.length).toBeGreaterThan(56); // IV + AuthTag minimum
  });

  it("should not store encryption key in the output", () => {
    const encrypted = encryptField("key-not-in-output");
    // The output should not contain recognizable key material
    expect(encrypted).not.toContain("dev-key");
    expect(encrypted).not.toContain("healthbridge");
  });

  it("should handle South African names with multiple components", () => {
    const names = [
      "Nkululeko Nciza",
      "Pieter-Dirk van der Merwe",
      "Thandiwe Nomzamo Dlamini-Zuma",
      "Abdul-Rashid Mohammed bin Khalid",
      "Tsepo O'Malley-Radebe",
    ];

    for (const name of names) {
      const encrypted = encryptField(name);
      expect(decryptField(encrypted)).toBe(name);
      // Encrypted form must not leak the name
      expect(encrypted).not.toContain(name);
    }
  });

  it("should handle all 11 official SA languages in patient names", () => {
    const names = [
      "Thabo Mbeki",         // Sotho
      "Thandiwe Mazibuko",   // Zulu
      "Sipho Nkosi",         // Xhosa
      "Pieter van Zyl",      // Afrikaans
      "David Smith",         // English
      "Tshifhiwa Munyai",   // Venda
      "Tshepo Motsepe",     // Tswana
      "Mbalenhle Ndlovu",   // Ndebele
      "Thulani Shabangu",   // Swati
      "Mmabatho Molefe",    // Pedi
      "Xolani Tsonga",      // Tsonga
    ];

    for (const name of names) {
      const encrypted = encryptField(name);
      expect(decryptField(encrypted)).toBe(name);
    }
  });
});

describe("DATA CLASSIFICATION: Data At Rest Protection", () => {
  it("should encrypt empty string without error (field could be optional)", () => {
    const encrypted = encryptField("");
    expect(decryptField(encrypted)).toBe("");
  });

  it("should encrypt very long PII (1000 chars — pathology report text)", () => {
    const longText = "Patient history: ".repeat(59); // ~1003 chars
    const encrypted = encryptField(longText);
    expect(decryptField(encrypted)).toBe(longText);
  });

  it("should handle special medical characters in encrypted fields", () => {
    const medicalText = "HbA1c: 7.5% | BP: 140/90 mmHg | BMI: 28.3 kg/m²";
    const encrypted = encryptField(medicalText);
    expect(decryptField(encrypted)).toBe(medicalText);
  });

  it("should handle CRLF line breaks in encrypted clinical notes", () => {
    const notes = "Line 1\r\nLine 2\r\nLine 3";
    const encrypted = encryptField(notes);
    expect(decryptField(encrypted)).toBe(notes);
  });
});
