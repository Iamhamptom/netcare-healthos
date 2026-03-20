// Healthbridge — Patient ID encryption & masking
// AES-256-GCM for field-level encryption of sensitive identifiers (SA ID numbers, membership numbers).
// Uses Node.js built-in crypto only — no external dependencies.

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16;
// IMPORTANT: HEALTHBRIDGE_ENCRYPTION_SALT MUST be set in production to a unique, random value.
// A static fallback is provided for development only.
const SALT = process.env.HEALTHBRIDGE_ENCRYPTION_SALT || "healthbridge-default-salt-change-in-production";

/**
 * Derive a 32-byte key from the env var or fallback dev key.
 * Uses scrypt for key derivation so the env var can be any length.
 */
function getEncryptionKey(): Buffer {
  const rawKey =
    process.env.HEALTHBRIDGE_ENCRYPTION_KEY || "dev-key-do-not-use-in-production";
  return scryptSync(rawKey, SALT, 32);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a hex-encoded string: iv + authTag + ciphertext.
 */
export function encryptField(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack: iv (12) + authTag (16) + ciphertext (variable)
  return Buffer.concat([iv, authTag, encrypted]).toString("hex");
}

/**
 * Decrypt an AES-256-GCM encrypted field.
 * Expects hex-encoded input produced by encryptField.
 */
export function decryptField(ciphertext: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(ciphertext, "hex");

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Mask a South African ID number, showing only the last 7 digits.
 * e.g. "9205015012089" → "******5012089"
 */
export function maskIdNumber(idNumber: string): string {
  if (idNumber.length <= 7) return idNumber;
  const visible = idNumber.slice(-7);
  const masked = "*".repeat(idNumber.length - 7);
  return masked + visible;
}

/**
 * Mask a medical aid membership number, showing only the last 4 characters.
 * e.g. "DH12342345" → "******2345"
 */
export function maskMembership(membershipNo: string): string {
  if (membershipNo.length <= 4) return membershipNo;
  const visible = membershipNo.slice(-4);
  const masked = "*".repeat(membershipNo.length - 4);
  return masked + visible;
}
