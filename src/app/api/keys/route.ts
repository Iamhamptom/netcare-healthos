import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/api-keys";
import { sanitize } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "api-keys");
  if (isErrorResponse(guard)) return guard;

  const keys = await listApiKeys(guard.practiceId);
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "api-keys");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const name = body.name ? sanitize(body.name) : "Default";

  const result = await generateApiKey(guard.practiceId, name);

  return NextResponse.json({
    id: result.id,
    key: result.rawKey, // Only shown once — client must save it
    keyPreview: result.keyPreview,
    name: result.name,
    createdAt: result.createdAt,
    warning: "Save this key now. It will not be shown again.",
  }, { status: 201 });
}

export async function DELETE(request: Request) {
  const guard = await guardRoute(request, "api-keys");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");
  if (!keyId) {
    return NextResponse.json({ error: "Key ID is required (?id=...)" }, { status: 400 });
  }

  const revoked = await revokeApiKey(keyId);
  if (!revoked) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "API key revoked" });
}
