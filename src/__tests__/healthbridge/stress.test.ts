import { describe, it, expect } from "vitest";
import { validateClaim } from "@/lib/healthbridge/validator";
import { parseBatchCSV } from "@/lib/healthbridge/batch";
import { encryptField, decryptField } from "@/lib/healthbridge/encrypt";
import { paginateResult, parsePaginationParams } from "@/lib/healthbridge/pagination";

describe("PERFORMANCE: Validator Performance", () => {
  it("should validate 100 claims in under 100ms", () => {
    const claims = Array.from({ length: 100 }, (_, i) => ({
      patientName: `Patient ${i}`,
      patientDob: "1985-06-15",
      patientIdNumber: "8506155012089",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      providerNumber: "MP12345",
      treatingProvider: "Dr Smith",
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: "GP consultation", quantity: 1, amount: 52000 },
      ],
    }));

    const start = performance.now();
    for (const claim of claims) {
      validateClaim(claim);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
  });

  it("should validate a claim with 50 line items without timeout", () => {
    const lineItems = Array.from({ length: 50 }, (_, i) => ({
      icd10Code: i % 2 === 0 ? "I10" : "J06.9",
      cptCode: "0190",
      description: `Line item ${i}`,
      quantity: 1,
      amount: 52000,
    }));

    const start = performance.now();
    const result = validateClaim({
      patientName: "John Mokoena",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155012089",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      providerNumber: "MP12345",
      treatingProvider: "Dr Smith",
      lineItems,
    });
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
    expect(result).toHaveProperty("valid");
    expect(result.issues.length).toBeGreaterThan(0); // Should have duplicate ICD10 warnings
  });

  it("should validate a claim with 1000-char description without timeout", () => {
    const longDesc = "A".repeat(1000);
    const start = performance.now();
    const result = validateClaim({
      patientName: "John Mokoena",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155012089",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      providerNumber: "MP12345",
      treatingProvider: "Dr Smith",
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: longDesc, quantity: 1, amount: 52000 },
      ],
    });
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
    // 1000 chars > 500 limit, should have error
    expect(result.issues.some(i => i.code === "DESCRIPTION_TOO_LONG")).toBe(true);
  });
});

describe("PERFORMANCE: Batch Parsing", () => {
  it("should parse 500-row CSV in under 500ms", () => {
    const header = "patient_name,scheme,membership,icd10,amount";
    const dataRows = Array.from({ length: 500 }, (_, i) =>
      `Patient${i},Discovery Health,90001${String(i).padStart(4, "0")},I10,520`
    ).join("\n");
    const csv = `${header}\n${dataRows}`;

    const start = performance.now();
    const { rows, errors } = parseBatchCSV(csv);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(500);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(500);
  });

  it("should parse CSV with 20 columns without error", () => {
    const headers = Array.from({ length: 20 }, (_, i) =>
      i === 0 ? "patient_name" :
      i === 1 ? "scheme" :
      i === 2 ? "membership" :
      i === 3 ? "icd10" :
      i === 4 ? "amount" :
      `extra_col_${i}`
    ).join(",");
    const dataRow = Array.from({ length: 20 }, (_, i) =>
      i === 0 ? "John" :
      i === 1 ? "Discovery Health" :
      i === 2 ? "12345" :
      i === 3 ? "I10" :
      i === 4 ? "520" :
      `value_${i}`
    ).join(",");
    const csv = `${headers}\n${dataRow}`;

    const start = performance.now();
    const { rows, errors } = parseBatchCSV(csv);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].patientName).toBe("John");
  });
});

describe("PERFORMANCE: Encryption", () => {
  it("should encrypt/decrypt 10 strings in under 5 seconds (scrypt key derivation is intentionally slow)", () => {
    const strings = Array.from({ length: 10 }, (_, i) => `PII-data-${i}-8506155012089`);

    const start = performance.now();
    for (const str of strings) {
      const encrypted = encryptField(str);
      const decrypted = decryptField(encrypted);
      expect(decrypted).toBe(str);
    }
    const elapsed = performance.now() - start;

    // scrypt key derivation is intentionally slow (security feature)
    // 10 encrypt+decrypt round-trips should complete within 5s
    expect(elapsed).toBeLessThan(5000);
  });

  it("should encrypt long strings (10KB) without significant performance drop", () => {
    const longStr = "A".repeat(10240); // 10KB

    const start = performance.now();
    const encrypted = encryptField(longStr);
    const decrypted = decryptField(encrypted);
    const elapsed = performance.now() - start;

    expect(decrypted).toBe(longStr);
    expect(elapsed).toBeLessThan(500); // Allow headroom when running full suite in parallel
  });
});

describe("PERFORMANCE: Pagination Edge Cases", () => {
  it("should paginate 10,000 items correctly", () => {
    const total = 10000;
    const pageSize = 20;
    const totalPages = Math.ceil(total / pageSize); // 500

    // First page
    const first = paginateResult(Array(20).fill("item"), total, 1, pageSize);
    expect(first.pagination.totalPages).toBe(500);
    expect(first.pagination.hasNext).toBe(true);
    expect(first.pagination.hasPrev).toBe(false);

    // Middle page
    const middle = paginateResult(Array(20).fill("item"), total, 250, pageSize);
    expect(middle.pagination.hasNext).toBe(true);
    expect(middle.pagination.hasPrev).toBe(true);

    // Last page
    const last = paginateResult(Array(20).fill("item"), total, 500, pageSize);
    expect(last.pagination.hasNext).toBe(false);
    expect(last.pagination.hasPrev).toBe(true);
  });

  it("should handle page 500 of 500 pages with hasNext=false", () => {
    const result = paginateResult(Array(20).fill("x"), 10000, 500, 20);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.page).toBe(500);
    expect(result.pagination.totalPages).toBe(500);
  });

  it("should handle page beyond total gracefully", () => {
    const result = paginateResult([], 10000, 501, 20);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it("should handle pageSize=1 with many items", () => {
    const result = paginateResult(["item"], 10000, 1, 1);
    expect(result.pagination.totalPages).toBe(10000);
    expect(result.pagination.hasNext).toBe(true);
  });

  it("should handle page=1, pageSize=100 with 100 items", () => {
    const result = paginateResult(Array(100).fill("x"), 100, 1, 100);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("should clamp extreme pagination parameters", () => {
    const url = new URL("https://example.com/api/claims?page=999999&pageSize=999999");
    const params = parsePaginationParams(url);
    expect(params.pageSize).toBe(100); // Capped at MAX_PAGE_SIZE
    expect(params.page).toBe(999999); // Page is not capped (valid for large datasets)
  });
});
