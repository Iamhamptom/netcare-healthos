// CareOn Bridge Security Layer
// P0: Webhook HMAC verification, data de-identification, facility-scoped access

import { createHmac, timingSafeEqual } from "crypto";

// ── Webhook Authentication ──

/** Verify HMAC-SHA256 signature on inbound HL7 messages from CareOn */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expected = createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");

  // Timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/** Validate inbound request has proper authentication */
export function validateBridgeAuth(
  headers: Headers
): { valid: boolean; method: string; error?: string } {
  const hmacSig = headers.get("x-careon-hmac-sha256");
  const bearerToken = headers.get("authorization");
  const bridgeToken = process.env.CAREON_BRIDGE_TOKEN;
  const hmacSecret = process.env.CAREON_HMAC_SECRET;

  // Require at least one auth mechanism to be configured
  if (!bridgeToken && !hmacSecret) {
    // In demo mode (no tokens configured), allow all requests
    if (process.env.DEMO_MODE === "true") {
      return { valid: true, method: "demo" };
    }
    return { valid: false, method: "none", error: "No bridge authentication configured. Set CAREON_BRIDGE_TOKEN or CAREON_HMAC_SECRET." };
  }

  // HMAC takes priority (stronger, used by Deutsche Telekom integrations)
  // Note: HMAC header presence is checked here; actual signature verification
  // requires the payload and happens via verifyWebhookSignature() in the route handler
  if (hmacSecret && hmacSig) {
    return { valid: true, method: "hmac_pending_verify" };
  }

  // Bearer token fallback
  if (bridgeToken && bearerToken === `Bearer ${bridgeToken}`) {
    return { valid: true, method: "bearer" };
  }

  return { valid: false, method: "rejected", error: "Invalid or missing authentication credentials" };
}

// ── Data De-identification ──

/** Mask SA ID number: 8501015800086 -> 850101****086 */
export function maskIdNumber(idNumber: string): string {
  if (!idNumber || idNumber.length < 8) return idNumber;
  return idNumber.slice(0, 6) + "****" + idNumber.slice(-3);
}

/** Mask phone number: +27824561234 -> +27***1234 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  return phone.slice(0, 3) + "***" + phone.slice(-4);
}

/** Mask patient name for non-privileged views: Johan van der Merwe -> J. v** d** M***** */
export function maskName(name: string): string {
  if (!name) return name;
  return name
    .split(" ")
    .map((part, i) => (i === 0 ? part.charAt(0) + "." : part.charAt(0) + "**"))
    .join(" ");
}

/** Mask medical aid number: DH-001-4521-88 -> DH-***-****-88 */
export function maskMedicalAidNo(memberNo: string): string {
  if (!memberNo || memberNo.length < 4) return memberNo;
  const parts = memberNo.split("-");
  if (parts.length >= 3) {
    return parts[0] + "-***-****-" + parts[parts.length - 1];
  }
  return memberNo.slice(0, 2) + "****" + memberNo.slice(-2);
}

export interface DeidentificationLevel {
  level: "full" | "partial" | "none";
  showPatientName: boolean;
  showIdNumber: boolean;
  showPhone: boolean;
  showMedicalAidNo: boolean;
  showAddress: boolean;
}

/** Get de-identification level based on user role */
export function getDeidentLevel(role: string): DeidentificationLevel {
  switch (role) {
    case "platform_admin":
    case "doctor":
      return { level: "none", showPatientName: true, showIdNumber: true, showPhone: true, showMedicalAidNo: true, showAddress: true };
    case "admin":
      return { level: "partial", showPatientName: true, showIdNumber: false, showPhone: true, showMedicalAidNo: false, showAddress: false };
    case "receptionist":
    case "nurse":
      return { level: "partial", showPatientName: true, showIdNumber: false, showPhone: false, showMedicalAidNo: false, showAddress: false };
    default:
      return { level: "full", showPatientName: false, showIdNumber: false, showPhone: false, showMedicalAidNo: false, showAddress: false };
  }
}

/** Apply de-identification to an advisory based on user role */
export function deidentifyAdvisory<T extends { patientName: string; patientMRN: string }>(
  advisory: T,
  role: string
): T {
  const level = getDeidentLevel(role);
  return {
    ...advisory,
    patientName: level.showPatientName ? advisory.patientName : maskName(advisory.patientName),
    patientMRN: level.level === "full" ? advisory.patientMRN.replace(/\d/g, "*") : advisory.patientMRN,
  };
}

// ── Facility-Scoped Access ──

/** Check if a user has access to a specific facility's data */
export function hasAccessToFacility(
  userFacilityCodes: string[],
  advisoryFacility: string,
  userRole: string
): boolean {
  // Platform admins see everything
  if (userRole === "platform_admin") return true;

  // If no facility restriction set, allow (backwards compat)
  if (!userFacilityCodes || userFacilityCodes.length === 0) return true;

  // Check if the advisory's facility matches any of the user's assigned facilities
  const normalizedAdvisory = advisoryFacility.toLowerCase().replace(/\s+/g, "_");
  return userFacilityCodes.some((code) =>
    normalizedAdvisory.includes(code.toLowerCase())
  );
}

// ── Audit Logging ──

export interface BridgeAuditEntry {
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  advisoryId?: string;
  facility?: string;
  patientMRN?: string;
  detail: string;
  ipAddress?: string;
}

// In-memory audit log (demo mode) — production uses persistent storage
const auditLog: BridgeAuditEntry[] = [];

/** Log an audit entry for POPIA compliance */
export function logBridgeAudit(entry: Omit<BridgeAuditEntry, "timestamp">) {
  auditLog.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep last 1000 entries in memory
  if (auditLog.length > 1000) auditLog.length = 1000;
}

/** Get audit log entries */
export function getBridgeAuditLog(limit = 50): BridgeAuditEntry[] {
  return auditLog.slice(0, limit);
}
