import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";

export async function POST() {
  if (!isDemoMode) {
    const { clearSession } = await import("@/lib/auth");
    await clearSession();
  }
  return NextResponse.json({ ok: true });
}
