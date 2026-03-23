import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { writeFile, readFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/recordings");
const INDEX_FILE = path.join(UPLOAD_DIR, "index.json");
const MAX_RECORDINGS = 50;

interface RecordingEntry {
  id: string;
  filename: string;
  duration: number;
  patientName: string;
  transcriptPreview: string;
  createdAt: string;
}

async function getIndex(): Promise<RecordingEntry[]> {
  try {
    const data = await readFile(INDEX_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveIndex(entries: RecordingEntry[]) {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  await writeFile(INDEX_FILE, JSON.stringify(entries, null, 2));
}

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, "intake-recordings-list", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const recordings = await getIndex();
  return NextResponse.json({ recordings });
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "intake-recordings-save", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;
    const duration = parseInt(String(formData.get("duration") || "0"), 10);
    const patientName = String(formData.get("patientName") || "Unknown");
    const transcriptPreview = String(formData.get("transcriptPreview") || "");

    if (!audio) return NextResponse.json({ error: "No audio provided" }, { status: 400 });

    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

    const id = `rec-${Date.now()}`;
    const filename = `${id}.webm`;
    const buffer = Buffer.from(await audio.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const entry: RecordingEntry = {
      id,
      filename,
      duration,
      patientName,
      transcriptPreview: transcriptPreview.slice(0, 200),
      createdAt: new Date().toISOString(),
    };

    const index = await getIndex();
    index.unshift(entry);
    const trimmed = index.slice(0, MAX_RECORDINGS);
    await saveIndex(trimmed);

    return NextResponse.json({ recording: entry });
  } catch (err) {
    console.error("Recording save error:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
