// Simulation endpoint — generates a new HL7 event for demo purposes
// GET: returns a new simulated message + advisory
// Used by the Bridge Console in demo mode to show live data flowing

import { NextResponse } from "next/server";
import { generateSimulatedEvent } from "@/lib/hl7/demo-simulator";

export async function GET() {
  const event = generateSimulatedEvent();
  return NextResponse.json(event);
}
