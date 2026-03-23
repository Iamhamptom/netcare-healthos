import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { writeFile, readFile, unlink } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/intake");
const INDEX_FILE = path.join(UPLOAD_DIR, "index.json");

interface FileEntry {
  id: string;
  filename: string;
  originalName: string;
  category: string;
  size: number;
  patientId: string;
  createdAt: string;
}

async function getIndex(): Promise<FileEntry[]> {
  try {
    const data = await readFile(INDEX_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveIndex(entries: FileEntry[]) {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  await writeFile(INDEX_FILE, JSON.stringify(entries, null, 2));
}

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, "intake-files-list", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const files = await getIndex();
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "intake-files-upload", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = String(formData.get("category") || "other");
    const patientId = String(formData.get("patientId") || "");

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    if (!allowed.includes(ext)) return NextResponse.json({ error: "File type not allowed" }, { status: 400 });

    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

    const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${id}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const entry: FileEntry = {
      id,
      filename,
      originalName: file.name,
      category,
      size: file.size,
      patientId,
      createdAt: new Date().toISOString(),
    };

    const index = await getIndex();
    index.unshift(entry);
    await saveIndex(index);

    return NextResponse.json({ file: entry });
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const rl = await rateLimitByIp(request, "intake-files-delete", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const index = await getIndex();
  const entry = index.find(f => f.id === id);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const filePath = path.join(UPLOAD_DIR, entry.filename);
    if (existsSync(filePath)) await unlink(filePath);
  } catch { /* file may already be gone */ }

  const updated = index.filter(f => f.id !== id);
  await saveIndex(updated);

  return NextResponse.json({ ok: true });
}
