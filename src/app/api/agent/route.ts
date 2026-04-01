export const maxDuration = 60;

import { createAgentUIStreamResponse } from "ai";
import { healthOSAgent } from "@/lib/agents/health-os-agent";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "agent", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const { messages } = await request.json();

  return createAgentUIStreamResponse({
    agent: healthOSAgent,
    uiMessages: messages,
  });
}
