/**
 * MFA (TOTP) Implementation for VisioHealth
 * - TOTP generation and verification (RFC 6238, 30-second window)
 * - Backup code generation with bcrypt hashing
 * - No external TOTP library — pure crypto implementation
 */

import crypto from "crypto";

// ── Base32 encoding/decoding (RFC 4648) ──

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let result = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return result;
}

function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of cleaned) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

// ── TOTP Core ──

function generateHOTP(secret: Buffer, counter: bigint): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(counter);

  const hmac = crypto.createHmac("sha1", secret);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  return (code % 1_000_000).toString().padStart(6, "0");
}

function getTOTPCounter(timeStepSeconds = 30): bigint {
  return BigInt(Math.floor(Date.now() / 1000 / timeStepSeconds));
}

// ── Public API ──

/** Generate a new TOTP secret (20 bytes, base32 encoded) */
export function generateSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/** Generate an otpauth:// URL for authenticator apps */
export function generateQRUrl(email: string, secret: string): string {
  const issuer = "VisioHealth";
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Verify a TOTP token against a secret. Allows 1 step drift (previous + current + next window). */
export function verifyToken(secret: string, token: string): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) return false;

  const secretBuffer = base32Decode(secret);
  const counter = getTOTPCounter();

  // Check current window, +1 step, -1 step (drift tolerance)
  for (let drift = -1; drift <= 1; drift++) {
    const expected = generateHOTP(secretBuffer, counter + BigInt(drift));
    // Constant-time comparison to prevent timing attacks
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))) {
      return true;
    }
  }

  return false;
}

/** Generate 8 backup codes (8-char hex each) */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString("hex"));
  }
  return codes;
}

/** Hash a backup code with bcrypt for storage */
export async function hashBackupCode(code: string): Promise<string> {
  const bcrypt = (await import("bcryptjs")).default;
  return bcrypt.hash(code, 10);
}

/** Verify a backup code against a bcrypt hash */
export async function verifyBackupCode(hashed: string, code: string): Promise<boolean> {
  const bcrypt = (await import("bcryptjs")).default;
  return bcrypt.compare(code, hashed);
}

/** Encrypt a TOTP secret for database storage */
export function encryptSecret(secret: string): string {
  const key = process.env.MFA_ENCRYPTION_KEY || process.env.JWT_SECRET || "default-key-change-me";
  const keyHash = crypto.createHash("sha256").update(key).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyHash, iv);
  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/** Decrypt a stored TOTP secret */
export function decryptSecret(encrypted: string): string {
  const key = process.env.MFA_ENCRYPTION_KEY || process.env.JWT_SECRET || "default-key-change-me";
  const keyHash = crypto.createHash("sha256").update(key).digest();
  const [ivHex, data] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyHash, iv);
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
