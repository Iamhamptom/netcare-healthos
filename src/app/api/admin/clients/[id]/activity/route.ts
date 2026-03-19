import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";

const CONTACT_TYPES = ["call", "email", "whatsapp", "meeting", "demo", "site_visit"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "admin-clients-activity");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();

  if (!body.type || !body.title) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  const client = await db.getClient(id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const activity = await db.createActivity({
    clientId: id,
    type: body.type,
    title: body.title,
    description: body.description || "",
    metadata: body.metadata || "{}",
    createdBy: body.createdBy || "Dr. Hampton",
  });

  // Update lastContactAt/lastContactMethod if contact type
  if (CONTACT_TYPES.includes(body.type)) {
    await db.updateClient(id, {
      lastContactAt: new Date().toISOString(),
      lastContactMethod: body.type,
    });
  }

  return NextResponse.json({ activity }, { status: 201 });
}
