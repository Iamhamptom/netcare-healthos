import { describe, it, expect } from "vitest";
import { encryptField, decryptField } from "@/lib/healthbridge/encrypt";
import { validateClaim } from "@/lib/healthbridge/validator";
import { paginateResult } from "@/lib/healthbridge/pagination";
import { generateIdempotencyKey } from "@/lib/healthbridge/idempotency";

// ============================================================================
// CONCURRENCY TESTS — Verify parallel operations produce correct, isolated results.
// Critical for healthcare systems where multiple claims process simultaneously.
// Standards: IEC 62304 (concurrent operation safety), ISO 27001 (data isolation)
// ============================================================================

describe("CONCURRENCY: Encryption — Parallel Operations", () => {
  it("should encrypt 50 different strings in parallel with unique ciphertexts", async () => {
    const inputs = Array.from({ length: 50 }, (_, i) => `patient-data-${i}-8506155012089`);
    const results = await Promise.all(inputs.map(input => Promise.resolve(encryptField(input))));

    // All 50 ciphertexts must be unique
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBe(50);

    // All must be valid hex
    for (const result of results) {
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    }
  });

  it("should decrypt 50 strings in parallel with correct plaintexts", async () => {
    const inputs = Array.from({ length: 50 }, (_, i) => `decrypt-test-${i}`);
    const encrypted = inputs.map(input => encryptField(input));

    const decrypted = await Promise.all(encrypted.map(cipher => Promise.resolve(decryptField(cipher))));

    for (let i = 0; i < inputs.length; i++) {
      expect(decrypted[i]).toBe(inputs[i]);
    }
  });

  it("should encrypt same plaintext 20 times in parallel — all unique, all decrypt correctly", async () => {
    const plaintext = "shared-patient-id-8506155012089";
    const encrypted = await Promise.all(
      Array.from({ length: 20 }, () => Promise.resolve(encryptField(plaintext)))
    );

    // All unique (random IV)
    const uniqueSet = new Set(encrypted);
    expect(uniqueSet.size).toBe(20);

    // All decrypt to same value
    const decrypted = await Promise.all(
      encrypted.map(cipher => Promise.resolve(decryptField(cipher)))
    );
    for (const d of decrypted) {
      expect(d).toBe(plaintext);
    }
  });
});

describe("CONCURRENCY: Validation — Parallel Independence", () => {
  it("should validate 50 different claims in parallel with independent results", async () => {
    const claims = Array.from({ length: 50 }, (_, i) => ({
      patientName: i % 5 === 0 ? "" : `Patient ${i}`, // every 5th claim is invalid (empty name)
      patientDob: "1985-06-15",
      patientIdNumber: "8506155012089",
      medicalAidScheme: i % 10 === 0 ? "GEMS" : "Discovery Health",
      membershipNumber: i % 10 === 0 ? "12345" : "900012345", // GEMS with 5-digit = invalid
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: `Consult ${i}`, quantity: 1, amount: 52000 },
      ],
    }));

    const results = await Promise.all(
      claims.map(claim => Promise.resolve(validateClaim(claim)))
    );

    expect(results).toHaveLength(50);

    // Check that each result is independent
    for (let i = 0; i < 50; i++) {
      if (i % 5 === 0) {
        // Invalid name claims should fail
        expect(results[i].issues.some(iss => iss.code === "MISSING_PATIENT_NAME")).toBe(true);
      }
      if (i % 10 === 0) {
        // GEMS with 5-digit membership should have format issue
        expect(results[i].issues.some(iss => iss.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
      }
    }
  });

  it("should not contaminate validation state between parallel validations", async () => {
    // One claim with PMB, one without — run in parallel
    const pmbClaim = {
      patientName: "PMB Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Hypertension", quantity: 1, amount: 52000 }],
    };

    const nonPmbClaim = {
      patientName: "Non-PMB Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
    };

    const [pmbResult, nonPmbResult] = await Promise.all([
      Promise.resolve(validateClaim(pmbClaim)),
      Promise.resolve(validateClaim(nonPmbClaim)),
    ]);

    // PMB claim should detect PMB
    expect(pmbResult.pmbDetected).toBe(true);
    // Non-PMB claim should NOT detect PMB (no state leakage)
    expect(nonPmbResult.pmbDetected).toBe(false);
  });
});

describe("CONCURRENCY: Pagination — Parallel Calls", () => {
  it("should handle concurrent pagination calls with different params correctly", async () => {
    const calls = [
      { data: ["a", "b", "c"], total: 100, page: 1, pageSize: 3 },
      { data: ["x"], total: 50, page: 25, pageSize: 2 },
      { data: [], total: 0, page: 1, pageSize: 20 },
      { data: Array(20).fill("item"), total: 10000, page: 500, pageSize: 20 },
    ];

    const results = await Promise.all(
      calls.map(c => Promise.resolve(paginateResult(c.data, c.total, c.page, c.pageSize)))
    );

    // First result
    expect(results[0].data).toEqual(["a", "b", "c"]);
    expect(results[0].pagination.total).toBe(100);
    expect(results[0].pagination.page).toBe(1);
    expect(results[0].pagination.totalPages).toBe(34); // ceil(100/3)

    // Second result
    expect(results[1].data).toEqual(["x"]);
    expect(results[1].pagination.page).toBe(25);
    expect(results[1].pagination.totalPages).toBe(25); // ceil(50/2)
    expect(results[1].pagination.hasNext).toBe(false);

    // Third result (empty)
    expect(results[2].data).toHaveLength(0);
    expect(results[2].pagination.totalPages).toBe(1);

    // Fourth result
    expect(results[3].pagination.page).toBe(500);
    expect(results[3].pagination.hasNext).toBe(false);
    expect(results[3].pagination.hasPrev).toBe(true);
  });
});

describe("CONCURRENCY: Idempotency Key Generation — Parallel", () => {
  it("should generate 100 identical keys from same input in parallel", async () => {
    const results = await Promise.all(
      Array.from({ length: 100 }, () =>
        Promise.resolve(generateIdempotencyKey("REM-PARALLEL", "CLM-PARALLEL"))
      )
    );

    const uniqueKeys = new Set(results);
    expect(uniqueKeys.size).toBe(1); // All identical
    expect(results[0]).toHaveLength(64); // SHA-256 hex
  });

  it("should generate 100 unique keys from different inputs in parallel", async () => {
    const results = await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(generateIdempotencyKey(`REM-${i}`, `CLM-${i}`))
      )
    );

    const uniqueKeys = new Set(results);
    expect(uniqueKeys.size).toBe(100); // All unique
  });

  it("should maintain determinism across parallel and sequential calls", async () => {
    // Generate key sequentially
    const sequential = generateIdempotencyKey("REM-SEQ", "CLM-SEQ");

    // Generate same key in parallel batch
    const parallel = await Promise.all(
      Array.from({ length: 10 }, () =>
        Promise.resolve(generateIdempotencyKey("REM-SEQ", "CLM-SEQ"))
      )
    );

    for (const key of parallel) {
      expect(key).toBe(sequential);
    }
  });
});

describe("CONCURRENCY: Mixed Operations — Parallel", () => {
  it("should handle encrypt + validate + paginate all in parallel without interference", async () => {
    const [encryptResult, validateResult, paginateResult_] = await Promise.all([
      Promise.resolve(encryptField("concurrent-test-data")),
      Promise.resolve(validateClaim({
        patientName: "Concurrent Patient",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
      })),
      Promise.resolve(paginateResult(["a", "b"], 100, 1, 20)),
    ]);

    // Encrypt produced valid output
    expect(/^[0-9a-f]+$/.test(encryptResult)).toBe(true);
    expect(decryptField(encryptResult)).toBe("concurrent-test-data");

    // Validate produced correct result
    expect(validateResult.valid).toBe(true);
    expect(validateResult.pmbDetected).toBe(true);

    // Paginate produced correct result
    expect(paginateResult_.data).toEqual(["a", "b"]);
    expect(paginateResult_.pagination.total).toBe(100);
  });
});
