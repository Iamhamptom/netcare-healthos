import { describe, it, expect } from "vitest";
import { encryptField, decryptField, maskIdNumber, maskMembership } from "@/lib/healthbridge/encrypt";

describe("Field Encryption — encryptField / decryptField", () => {
  it("should round-trip encrypt then decrypt to original plaintext", () => {
    const original = "8506155012089";
    const encrypted = encryptField(original);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it("should produce different ciphertext each time (random IV)", () => {
    const plaintext = "same-input";
    const a = encryptField(plaintext);
    const b = encryptField(plaintext);
    expect(a).not.toBe(b); // Different IVs → different output
    // But both should decrypt to the same value
    expect(decryptField(a)).toBe(plaintext);
    expect(decryptField(b)).toBe(plaintext);
  });

  it("should handle empty string", () => {
    const encrypted = encryptField("");
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe("");
  });

  it("should handle very long strings", () => {
    const longString = "A".repeat(10000);
    const encrypted = encryptField(longString);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(longString);
  });

  it("should handle special characters", () => {
    const special = "O'Brien & José <Müller> \"test\" 日本語";
    const encrypted = encryptField(special);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(special);
  });

  it("should handle unicode emoji", () => {
    const emoji = "Patient 🏥💊";
    const encrypted = encryptField(emoji);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(emoji);
  });

  it("should produce hex-encoded output", () => {
    const encrypted = encryptField("test");
    expect(/^[0-9a-f]+$/.test(encrypted)).toBe(true);
  });

  it("should throw on tampered ciphertext", () => {
    const encrypted = encryptField("test");
    // Tamper with the ciphertext
    const tampered = encrypted.slice(0, -2) + "ff";
    expect(() => decryptField(tampered)).toThrow();
  });

  it("should throw on truncated ciphertext", () => {
    const encrypted = encryptField("test");
    const truncated = encrypted.slice(0, 20);
    expect(() => decryptField(truncated)).toThrow();
  });
});

describe("ID Number Masking — maskIdNumber", () => {
  it("should mask a standard 13-digit SA ID showing last 7", () => {
    expect(maskIdNumber("8506155012089")).toBe("******5012089");
  });

  it("should mask a shorter ID", () => {
    expect(maskIdNumber("12345678")).toBe("*2345678");
  });

  it("should return as-is if 7 chars or fewer", () => {
    expect(maskIdNumber("1234567")).toBe("1234567");
    expect(maskIdNumber("123")).toBe("123");
    expect(maskIdNumber("")).toBe("");
  });

  it("should handle exactly 8 characters", () => {
    expect(maskIdNumber("12345678")).toBe("*2345678");
  });

  it("should handle passport-style IDs", () => {
    expect(maskIdNumber("A12345678")).toBe("**2345678");
  });
});

describe("Membership Masking — maskMembership", () => {
  it("should mask a standard membership showing last 4", () => {
    expect(maskMembership("DH12342345")).toBe("******2345");
  });

  it("should mask a 9-digit GEMS number", () => {
    expect(maskMembership("000012345")).toBe("*****2345");
  });

  it("should return as-is if 4 chars or fewer", () => {
    expect(maskMembership("1234")).toBe("1234");
    expect(maskMembership("AB")).toBe("AB");
    expect(maskMembership("")).toBe("");
  });

  it("should handle exactly 5 characters", () => {
    expect(maskMembership("12345")).toBe("*2345");
  });
});
