import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/** GET /api/microsoft/onedrive — List files from connected OneDrive */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "microsoft-onedrive");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "";

  if (isDemoMode) {
    return NextResponse.json({
      files: [
        { id: "f1", name: "Patient List March 2026.xlsx", size: 245760, modified: "2026-03-28T10:00:00Z", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        { id: "f2", name: "Lab Results Q1.pdf", size: 1048576, modified: "2026-03-25T14:00:00Z", type: "application/pdf" },
        { id: "f3", name: "Engagement Report.docx", size: 102400, modified: "2026-03-30T09:00:00Z", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { id: "f4", name: "Templates", size: 0, modified: "2026-03-20T08:00:00Z", type: "folder" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });

  const ms = await import("@/lib/microsoft");
  const integrations = ms.parseIntegrations(practice.integrations);
  const msConfig = ms.getMicrosoftConfig(integrations);
  if (!msConfig) return NextResponse.json({ error: "Microsoft 365 not connected" }, { status: 400 });

  const authResult = await ms.getValidAccessToken(integrations);
  if (authResult.didRefresh) {
    await prisma.practice.update({ where: { id: guard.practiceId }, data: { integrations: JSON.stringify(authResult.updatedIntegrations) } });
  }

  const endpoint = path
    ? `/me/drive/root:/${encodeURIComponent(path)}:/children?$select=id,name,size,lastModifiedDateTime,file`
    : "/me/drive/root/children?$select=id,name,size,lastModifiedDateTime,file&$top=50";

  const result = await ms.graphRequest<{
    value: { id: string; name: string; size: number; lastModifiedDateTime: string; file?: { mimeType: string } }[];
  }>(endpoint, authResult.accessToken);

  if (!result.ok) return NextResponse.json({ error: "Failed to list files" }, { status: 502 });

  return NextResponse.json({
    files: (result.data.value || []).map((f) => ({
      id: f.id, name: f.name, size: f.size, modified: f.lastModifiedDateTime,
      type: f.file?.mimeType ?? "folder",
    })),
  });
}
