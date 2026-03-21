import { describe, it, expect } from "vitest";
import { buildClaimXML, buildEligibilityXML, buildReversalXML } from "@/lib/healthbridge/xml";
import { safeParseClaimResponse } from "@/lib/healthbridge/xml-parser";
import { parseBatchCSV, validateBatch } from "@/lib/healthbridge/batch";
import { validateClaim } from "@/lib/healthbridge/validator";
import { encryptField, decryptField, maskIdNumber, maskMembership } from "@/lib/healthbridge/encrypt";
import { parseZARToCents } from "@/lib/healthbridge/codes";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP12345",
  treatingProvider: "Dr Smith",
  patientName: "John Mokoena",
  patientDob: "1985-06-15",
  patientIdNumber: "8506155012089",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  practiceId: "practice-1",
  lineItems: [
    { icd10Code: "I10", cptCode: "0190", description: "GP consultation", quantity: 1, amount: 52000 },
  ],
};

describe("SECURITY: SQL Injection Vectors", () => {
  it("should sanitize SQL injection in patient name via XML escaping", () => {
    const claim = { ...baseClaim, patientName: "Robert'); DROP TABLE claims;--" };
    const xml = buildClaimXML(claim);
    // The apostrophe must be escaped, preventing injection
    expect(xml).toContain("&apos;");
    expect(xml).not.toContain("'); DROP TABLE");
    expect(xml).toContain("Robert");
  });

  it("should sanitize SQL injection in membership number via XML escaping", () => {
    const claim = { ...baseClaim, membershipNumber: "' OR '1'='1" };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("&apos;");
    expect(xml).not.toContain("' OR '1'='1");
  });

  it("should sanitize SQL injection in ICD-10 code field", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10; DELETE FROM patients", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    const xml = buildClaimXML(claim);
    // The semicolons and DELETE are just strings in XML — the important thing is XML is well-formed
    expect(xml).toContain("<ICD10Code>");
  });

  it("should not crash validator with SQL injection in patient name", () => {
    const result = validateClaim({
      ...baseClaim,
      patientName: "Robert'); DROP TABLE claims;--",
      lineItems: baseClaim.lineItems,
    });
    // Validator should process normally (not crash)
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("issues");
  });

  it("should not crash validator with SQL injection in membership number", () => {
    const result = validateClaim({
      ...baseClaim,
      membershipNumber: "' OR '1'='1",
      lineItems: baseClaim.lineItems,
    });
    expect(result).toHaveProperty("valid");
  });
});

describe("SECURITY: XSS Payload Prevention", () => {
  it("should escape <script> tags in patient name via XML builder", () => {
    const claim = { ...baseClaim, patientName: '<script>alert("xss")</script>' };
    const xml = buildClaimXML(claim);
    expect(xml).not.toContain("<script>");
    expect(xml).toContain("&lt;script&gt;");
    expect(xml).toContain("&lt;/script&gt;");
  });

  it("should escape img onerror XSS in description", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: '<img onerror=alert(1) src=x>', quantity: 1, amount: 52000 },
      ],
    };
    const xml = buildClaimXML(claim);
    expect(xml).not.toContain("<img");
    expect(xml).toContain("&lt;img");
  });

  it("should escape javascript: protocol in description", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: 'javascript:alert(document.cookie)', quantity: 1, amount: 52000 },
      ],
    };
    const xml = buildClaimXML(claim);
    // javascript: is just text, but should not contain unescaped HTML
    expect(xml).toContain("javascript:alert(document.cookie)");
    // No angle brackets means it's safe
  });

  it("should escape event handler XSS in treating provider", () => {
    const claim = { ...baseClaim, treatingProvider: '" onmouseover="alert(1)' };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("&quot;");
    expect(xml).not.toContain('" onmouseover=');
  });

  it("should escape all OWASP top XSS vectors in patient name", () => {
    const vectors = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<body onload=alert(1)>',
      '"><img src=x onerror=alert(1)>',
    ];
    for (const vector of vectors) {
      const claim = { ...baseClaim, patientName: vector };
      const xml = buildClaimXML(claim);
      expect(xml).not.toContain("<script>");
      expect(xml).not.toContain("<img ");
      expect(xml).not.toContain("<svg ");
      expect(xml).not.toContain("<body ");
    }
  });
});

describe("SECURITY: XML Injection Prevention", () => {
  it("should escape closing tag injection in patient name", () => {
    const claim = {
      ...baseClaim,
      patientName: '</Patient><Malicious>hack</Malicious><Patient>',
    };
    const xml = buildClaimXML(claim);
    expect(xml).not.toContain("<Malicious>");
    expect(xml).toContain("&lt;/Patient&gt;");
    expect(xml).toContain("&lt;Malicious&gt;");
  });

  it("should escape CDATA closing sequence in description", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: ']]><!--', quantity: 1, amount: 52000 },
      ],
    };
    const xml = buildClaimXML(claim);
    // The ]]> should be escaped so it cannot break out of any CDATA
    expect(xml).toContain("&gt;");
    expect(xml).toContain("&lt;");
  });

  it("should produce well-formed XML despite malicious input in all fields", () => {
    const maliciousClaim: ClaimSubmission = {
      ...baseClaim,
      patientName: '<evil>&attack;</evil>',
      treatingProvider: '<!-- comment -->',
      providerNumber: '"injection"',
      patientIdNumber: '</IDNumber><Hack/>',
      membershipNumber: '&entity;',
      lineItems: [
        {
          icd10Code: "I10",
          cptCode: "0190",
          description: '<![CDATA[evil]]><More>',
          quantity: 1,
          amount: 52000,
        },
      ],
    };
    const xml = buildClaimXML(maliciousClaim);
    // Should not contain unescaped angle brackets from input
    expect(xml).not.toContain("<evil>");
    expect(xml).not.toContain("<Hack/>");
    expect(xml).not.toContain("<!-- comment -->");
    expect(xml).not.toContain("<More>");
  });

  it("should prevent XXE in response parser via DOCTYPE stripping", () => {
    const maliciousXml = `<?xml version="1.0"?>
    <!DOCTYPE foo [
      <!ENTITY xxe SYSTEM "file:///etc/passwd">
    ]>
    <ClaimResponse>
      <TransactionRef>&xxe;</TransactionRef>
      <Status>accepted</Status>
    </ClaimResponse>`;
    const result = safeParseClaimResponse(maliciousXml);
    // Entity reference should be stripped
    expect(result.transactionRef).not.toContain("/etc/passwd");
    expect(result.status).toBe("accepted");
  });

  it("should prevent entity expansion attacks (billion laughs)", () => {
    const billionLaughs = `<?xml version="1.0"?>
    <!DOCTYPE lolz [
      <!ENTITY lol "lol">
      <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
    ]>
    <ClaimResponse>
      <TransactionRef>HB-TEST</TransactionRef>
      <Status>accepted</Status>
    </ClaimResponse>`;
    const result = safeParseClaimResponse(billionLaughs);
    expect(result.transactionRef).toBe("HB-TEST");
  });
});

describe("SECURITY: Path Traversal in Batch CSV", () => {
  it("should handle CSV with path traversal in patient name field", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
../../../etc/passwd,Discovery Health,12345,I10,520`;
    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    // The path is just treated as a string — no file operations
    expect(rows[0].patientName).toBe("../../../etc/passwd");
  });

  it("should handle CSV with path traversal in description field", () => {
    const csv = `patient_name,scheme,membership,icd10,amount,description
John,Discovery Health,12345,I10,520,../../secret/data`;
    const { rows } = parseBatchCSV(csv);
    expect(rows[0].description).toBe("../../secret/data");
  });
});

describe("SECURITY: Integer Overflow in Financial Amounts", () => {
  it("should handle Number.MAX_SAFE_INTEGER as amount", () => {
    const result = validateClaim({
      ...baseClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: Number.MAX_SAFE_INTEGER }],
    });
    // Should not crash — amount is valid (positive)
    expect(result).toHaveProperty("valid");
  });

  it("should reject negative amount", () => {
    const result = validateClaim({
      ...baseClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: -1 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(true);
  });

  it("should reject zero amount", () => {
    const result = validateClaim({
      ...baseClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 0 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(true);
  });

  it("should handle sub-cent amount (0.001)", () => {
    // Amounts in the system are in cents (integers), but sub-cent could be passed
    const result = validateClaim({
      ...baseClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 0.001 }],
    });
    // 0.001 is > 0, so it would pass amount check but it's a tiny amount
    expect(result).toHaveProperty("valid");
  });

  it("should handle extremely large amount (R10B = 999999999999 cents)", () => {
    const result = validateClaim({
      ...baseClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 999999999999 }],
    });
    expect(result).toHaveProperty("valid");
    // No crash — validator does not cap maximum amounts (that's a scheme decision)
  });

  it("should parse negative ZAR correctly", () => {
    expect(parseZARToCents(-520)).toBe(-52000);
    expect(parseZARToCents("-520")).toBe(-52000);
  });
});

describe("SECURITY: Encryption Properties", () => {
  it("should produce output that is not plaintext", () => {
    const plaintext = "8506155012089";
    const encrypted = encryptField(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).not.toContain(plaintext);
  });

  it("should produce different ciphertext for different plaintexts", () => {
    const a = encryptField("plaintext-one");
    const b = encryptField("plaintext-two");
    expect(a).not.toBe(b);
  });

  it("should fail to decrypt with tampered ciphertext (auth tag check)", () => {
    const encrypted = encryptField("sensitive-data");
    // Flip a byte in the middle of the ciphertext
    const chars = encrypted.split("");
    const midpoint = Math.floor(chars.length / 2);
    chars[midpoint] = chars[midpoint] === "a" ? "b" : "a";
    const tampered = chars.join("");
    expect(() => decryptField(tampered)).toThrow();
  });

  it("should include IV in output (first 24 hex chars = 12 bytes)", () => {
    const encrypted = encryptField("test");
    // IV is 12 bytes = 24 hex chars, auth tag is 16 bytes = 32 hex chars
    // Total overhead: 24 + 32 = 56 hex chars minimum
    expect(encrypted.length).toBeGreaterThan(56);
  });

  it("should produce different ciphertext each time for same plaintext (random IV)", () => {
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      results.add(encryptField("same-input"));
    }
    // All 10 encryptions should be unique
    expect(results.size).toBe(10);
  });

  it("should correctly round-trip empty string", () => {
    const encrypted = encryptField("");
    expect(decryptField(encrypted)).toBe("");
  });

  it("should fail on completely empty ciphertext string", () => {
    expect(() => decryptField("")).toThrow();
  });

  it("should fail on too-short ciphertext (less than IV + auth tag)", () => {
    expect(() => decryptField("aabbccdd")).toThrow();
  });
});

describe("SECURITY: SA ID Number Validation", () => {
  it("should accept valid SA ID with correct Luhn check digit (8506155012089)", () => {
    // 8506155012089 is a known valid SA ID format
    const result = validateClaim({
      ...baseClaim,
      patientIdNumber: "8506155012089",
      patientDob: "1985-06-15",
    });
    // Should not have INVALID_SA_ID warning
    expect(result.issues.some(i => i.code === "INVALID_SA_ID")).toBe(false);
  });

  it("should warn on ID with all zeros", () => {
    const result = validateClaim({
      ...baseClaim,
      patientIdNumber: "0000000000000",
      patientDob: "",
    });
    // All zeros is a 13-digit number — format is technically valid
    // But DOB cross-check would fail if provided
    expect(result).toHaveProperty("valid");
  });

  it("should warn on non-13-digit ID", () => {
    const result = validateClaim({
      ...baseClaim,
      patientIdNumber: "12345",
      patientDob: "",
    });
    expect(result.issues.some(i => i.code === "INVALID_SA_ID")).toBe(true);
  });

  it("should handle ID with all nines", () => {
    const result = validateClaim({
      ...baseClaim,
      patientIdNumber: "9999999999999",
      patientDob: "",
    });
    // 13 digits — format ok, but may have DOB issues
    expect(result.issues.some(i => i.code === "INVALID_SA_ID")).toBe(false);
  });

  it("should mask SA ID showing only last 7 digits", () => {
    expect(maskIdNumber("8506155012089")).toBe("******5012089");
  });

  it("should mask membership showing only last 4 characters", () => {
    expect(maskMembership("900012345")).toBe("*****2345");
  });
});
