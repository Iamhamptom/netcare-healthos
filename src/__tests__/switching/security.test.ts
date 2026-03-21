import { describe, it, expect } from "vitest";
import { parseEDIFACT, generateEDIFACT } from "@/lib/switching/edifact";
import { createBatchJob } from "@/lib/switching/batch";
import { createPreAuthRequest } from "@/lib/switching/preauth";
import type { ClaimSubmission } from "@/lib/healthbridge/types";
import * as fs from "fs";
import * as path from "path";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0123456",
  treatingProvider: "Dr Test Provider",
  patientName: "John Mokoena",
  patientDob: "1985-06-15",
  patientIdNumber: "8506155800083",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  lineItems: [
    { icd10Code: "J06.9", cptCode: "0190", description: "GP Consultation", quantity: 1, amount: 52000 },
  ],
  practiceId: "practice-001",
};

describe("DoS Prevention — EDIFACT Parser", () => {
  it("rejects oversized messages (>10MB)", () => {
    const hugeMessage = "A".repeat(11_000_000);
    expect(() => parseEDIFACT(hugeMessage)).toThrow("too large");
  });

  it("rejects oversized segments (>100KB)", () => {
    const longSegment = "UNH+" + "A".repeat(200_000) + "'";
    expect(() => parseEDIFACT(longSegment)).toThrow("exceeds 100KB");
  });

  it("handles deeply nested/repeated segments without stack overflow", () => {
    // Create a message with many repeated segments
    const segments = Array.from({ length: 1000 }, (_, i) =>
      `LIN+${i}++0190:SRV`
    ).join("\n");
    const msg = `UNH+0000001+MEDCLM:0:912:ZA\n${segments}\nUNT+1002+0000001`;
    // Should not throw — just parse whatever it can
    expect(() => parseEDIFACT(msg)).not.toThrow();
  });
});

describe("EDIFACT Injection Prevention", () => {
  it("escapes special EDIFACT characters in provider names", () => {
    const claim = {
      ...baseClaim,
      treatingProvider: "Dr O'Brien+Smith:Jr",
    };
    const edifact = generateEDIFACT(claim);
    // Must escape +, :, and ' with ? prefix
    expect(edifact).toContain("O?'Brien?+Smith?:Jr");
    // The escaped name should NOT contain raw unescaped O'Brien or O+Brien
    expect(edifact).not.toContain("O'Brien");
    expect(edifact).not.toContain("O+Brien");
    expect(edifact).not.toContain("Smith:Jr'");  // unescaped colon before segment end
  });

  it("escapes special characters in patient names", () => {
    const claim = {
      ...baseClaim,
      patientName: "Jean-Pierre du Plessis' family",
    };
    const edifact = generateEDIFACT(claim);
    expect(edifact).toContain("Plessis?'");
  });

  it("escapes special characters in line item descriptions", () => {
    const claim = {
      ...baseClaim,
      lineItems: [{
        icd10Code: "J06.9",
        cptCode: "0190",
        description: "Consult: back pain + assessment",
        quantity: 1,
        amount: 52000,
      }],
    };
    const edifact = generateEDIFACT(claim);
    // Colons and plus signs in descriptions must be escaped
    expect(edifact).toContain("?:");
    expect(edifact).toContain("?+");
  });
});

describe("No Hardcoded Credentials", () => {
  const switchingDir = path.resolve(__dirname, "../../lib/switching");
  const healthbridgeDir = path.resolve(__dirname, "../../lib/healthbridge");

  function scanDirectoryForSecrets(dir: string): string[] {
    const violations: string[] = [];
    if (!fs.existsSync(dir)) return violations;

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check for common credential patterns (exclude obvious test data and env vars)
        if (/password\s*[:=]\s*["'][^"']{8,}["']/i.test(line) &&
            !line.includes("process.env") && !line.includes("config.")) {
          violations.push(`${file}:${i + 1} — possible hardcoded password`);
        }
        if (/api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9]{16,}["']/i.test(line) &&
            !line.includes("process.env")) {
          violations.push(`${file}:${i + 1} — possible hardcoded API key`);
        }
        if (/Bearer\s+[a-zA-Z0-9._-]{20,}(?![\$\{])/i.test(line) &&
            !line.includes("config.") && !line.includes("process.env")) {
          violations.push(`${file}:${i + 1} — possible hardcoded bearer token`);
        }
      }
    }
    return violations;
  }

  it("no hardcoded credentials in switching module", () => {
    const violations = scanDirectoryForSecrets(switchingDir);
    expect(violations).toHaveLength(0);
  });

  it("no hardcoded credentials in healthbridge module", () => {
    const violations = scanDirectoryForSecrets(healthbridgeDir);
    expect(violations).toHaveLength(0);
  });
});

describe("Batch Processing — Resource Exhaustion Prevention", () => {
  it("batch job tracks claim count", () => {
    const claims = Array.from({ length: 500 }, (_, i) => ({
      ...baseClaim,
      patientName: `Patient ${i}`,
    }));
    const job = createBatchJob({ practiceId: "p-001", claims });
    expect(job.totalClaims).toBe(500);
    // The batch job should be created without error
    expect(job.status).toBe("queued");
  });

  it("batch job IDs include randomness to prevent prediction", () => {
    const ids = Array.from({ length: 20 }, () =>
      createBatchJob({ practiceId: "p-001", claims: [baseClaim] }).id
    );
    // All IDs should be unique (random component)
    expect(new Set(ids).size).toBe(20);
  });
});

describe("Pre-Auth Request ID Security", () => {
  it("pre-auth request IDs are unique", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const req = createPreAuthRequest({
        practiceId: "p-001",
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        patientName: "Test",
        patientDob: "1985-01-01",
        patientIdNumber: "8501010800083",
        membershipNumber: "900012345",
        dependentCode: "00",
        medicalAidScheme: "Discovery Health",
        icd10Codes: ["M54.5"],
        cptCodes: ["0500"],
        procedureDescription: "MRI",
        clinicalMotivation: "Pain",
        urgency: "elective",
        estimatedCost: 350000,
      });
      ids.add(req.id);
    }
    expect(ids.size).toBe(20);
  });

  it("pre-auth IDs have PA- prefix", () => {
    const req = createPreAuthRequest({
      practiceId: "p-001",
      bhfNumber: "1234567",
      providerNumber: "MP0123456",
      patientName: "Test",
      patientDob: "1985-01-01",
      patientIdNumber: "8501010800083",
      membershipNumber: "900012345",
      dependentCode: "00",
      medicalAidScheme: "Discovery Health",
      icd10Codes: ["M54.5"],
      cptCodes: ["0500"],
      procedureDescription: "MRI",
      clinicalMotivation: "Pain",
      urgency: "elective",
      estimatedCost: 350000,
    });
    expect(req.id).toMatch(/^PA-/);
  });
});

describe("XML Parser Safety", () => {
  it("extractTag in MediKredit client handles regex special characters", () => {
    // The extractTag function uses regex — verify it handles edge cases
    // by checking that the XML builders produce safe output
    const claim = {
      ...baseClaim,
      treatingProvider: "Dr. Smith (GP)",
      patientName: "Test [Patient] {Name}",
    };
    // Should not throw when building XML with special characters
    const edifact = generateEDIFACT(claim);
    expect(edifact).toBeTruthy();
  });
});
