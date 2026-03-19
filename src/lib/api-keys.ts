// API key management for external practice access
import { isDemoMode } from "@/lib/is-demo";
import crypto from "crypto";

// ─── In-memory demo store ───

interface ApiKeyRecord {
  id: string;
  practiceId: string;
  key: string; // hashed
  keyPreview: string;
  name: string;
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

let _demoKeys: ApiKeyRecord[] = [];
let _demoKeyCounter = 1;

// Map raw key → hash for demo validation
const _demoRawToHash: Record<string, string> = {};

function hashKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function generateRawKey(): string {
  const bytes = crypto.randomBytes(32);
  return `vhk_${bytes.toString("hex")}`;
}

// ─── Public API ───

/** Generate a new API key for a practice. Returns the raw key (shown only once). */
export async function generateApiKey(
  practiceId: string,
  name?: string
): Promise<{ id: string; rawKey: string; keyPreview: string; name: string; createdAt: string }> {
  const rawKey = generateRawKey();
  const hashed = hashKey(rawKey);
  const preview = rawKey.slice(0, 12) + "...";
  const keyName = name || "Default";

  if (isDemoMode) {
    const record: ApiKeyRecord = {
      id: `ak${_demoKeyCounter++}`,
      practiceId,
      key: hashed,
      keyPreview: preview,
      name: keyName,
      active: true,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
    };
    _demoKeys.push(record);
    _demoRawToHash[rawKey] = hashed;

    return { id: record.id, rawKey, keyPreview: preview, name: keyName, createdAt: record.createdAt };
  }

  const { prisma } = await import("@/lib/prisma");
  const record = await prisma.apiKey.create({
    data: {
      practiceId,
      key: hashed,
      keyPreview: preview,
      name: keyName,
    },
  });

  return { id: record.id, rawKey, keyPreview: preview, name: keyName, createdAt: record.createdAt.toISOString() };
}

/** Validate a raw API key. Returns { practiceId, keyId } or null. */
export async function validateApiKey(
  rawKey: string
): Promise<{ practiceId: string; keyId: string } | null> {
  if (!rawKey || !rawKey.startsWith("vhk_")) return null;

  const hashed = hashKey(rawKey);

  if (isDemoMode) {
    const record = _demoKeys.find((k) => k.key === hashed && k.active);
    if (!record) return null;
    record.lastUsedAt = new Date().toISOString();
    return { practiceId: record.practiceId, keyId: record.id };
  }

  const { prisma } = await import("@/lib/prisma");
  const record = await prisma.apiKey.findUnique({ where: { key: hashed } });
  if (!record || !record.active) return null;

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return { practiceId: record.practiceId, keyId: record.id };
}

/** List API keys for a practice (preview only, never full key). */
export async function listApiKeys(
  practiceId: string
): Promise<Array<{ id: string; keyPreview: string; name: string; active: boolean; lastUsedAt: string | null; createdAt: string }>> {
  if (isDemoMode) {
    return _demoKeys
      .filter((k) => k.practiceId === practiceId)
      .map(({ id, keyPreview, name, active, lastUsedAt, createdAt }) => ({
        id,
        keyPreview,
        name,
        active,
        lastUsedAt,
        createdAt,
      }));
  }

  const { prisma } = await import("@/lib/prisma");
  const keys = await prisma.apiKey.findMany({
    where: { practiceId },
    select: { id: true, keyPreview: true, name: true, active: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return keys.map((k) => ({
    ...k,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }));
}

/** Revoke an API key (sets active=false). */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  if (isDemoMode) {
    const record = _demoKeys.find((k) => k.id === keyId);
    if (!record) return false;
    record.active = false;
    return true;
  }

  const { prisma } = await import("@/lib/prisma");
  try {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { active: false },
    });
    return true;
  } catch {
    return false;
  }
}
