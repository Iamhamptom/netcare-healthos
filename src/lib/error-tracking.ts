/**
 * Lightweight Error Tracking System
 * In-memory error log with optional Supabase persistence.
 * For production at scale, replace with Sentry (@sentry/nextjs).
 */

export interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  severity: "error" | "warning" | "info";
}

const ERROR_LOG: ErrorEvent[] = [];
const MAX_ERRORS = 1000;

/** Capture an error event into the in-memory log */
export function captureError(
  error: Error | string,
  metadata?: Partial<Pick<ErrorEvent, "url" | "userId" | "metadata" | "severity">>
) {
  const event: ErrorEvent = {
    message: typeof error === "string" ? error : error.message,
    stack: typeof error === "string" ? undefined : error.stack,
    timestamp: new Date().toISOString(),
    severity: metadata?.severity ?? "error",
    url: metadata?.url,
    userId: metadata?.userId,
    metadata: metadata?.metadata,
  };

  ERROR_LOG.unshift(event);
  if (ERROR_LOG.length > MAX_ERRORS) ERROR_LOG.pop();

  // In production with Supabase, also persist to database
  if (typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    persistToSupabase(event).catch(() => {
      // Silent fail — don't let error tracking cause errors
    });
  }

  return event;
}

/** Capture a warning */
export function captureWarning(message: string, metadata?: Record<string, unknown>) {
  return captureError(message, { severity: "warning", metadata });
}

/** Capture an info event */
export function captureInfo(message: string, metadata?: Record<string, unknown>) {
  return captureError(message, { severity: "info", metadata });
}

/** Get recent errors from the in-memory log */
export function getRecentErrors(limit = 50): ErrorEvent[] {
  return ERROR_LOG.slice(0, limit);
}

/** Clear all errors from the in-memory log */
export function clearErrors(): void {
  ERROR_LOG.length = 0;
}

/** Get error counts by severity */
export function getErrorStats(): { errors: number; warnings: number; infos: number; total: number } {
  const errors = ERROR_LOG.filter((e) => e.severity === "error").length;
  const warnings = ERROR_LOG.filter((e) => e.severity === "warning").length;
  const infos = ERROR_LOG.filter((e) => e.severity === "info").length;
  return { errors, warnings, infos, total: ERROR_LOG.length };
}

// ── Supabase persistence (optional) ──

async function persistToSupabase(event: ErrorEvent): Promise<void> {
  try {
    const { supabaseAdmin } = await import("./supabase");
    await supabaseAdmin.from("ho_error_logs").insert({
      message: event.message,
      stack: event.stack?.substring(0, 4000), // Truncate long stacks
      url: event.url,
      user_id: event.userId,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      severity: event.severity,
      created_at: event.timestamp,
    });
  } catch {
    // Silent fail
  }
}
