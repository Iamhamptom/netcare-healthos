/**
 * Microsoft Graph API helper — REST-based (no @microsoft/microsoft-graph-client)
 *
 * Env vars required:
 *   MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID, NEXT_PUBLIC_APP_URL
 */

import { logger } from "@/lib/logger";

const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com";
const GRAPH_API = "https://graph.microsoft.com/v1.0";

const SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "Calendars.ReadWrite",
  "Mail.Send",
  "User.Read",
  "Files.ReadWrite",
].join(" ");

function getTenantId(): string {
  return process.env.MICROSOFT_TENANT_ID ?? "common";
}

function redirectUri(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/microsoft/callback`;
}

// ---------------------------------------------------------------------------
// OAuth helpers
// ---------------------------------------------------------------------------

/** Generate the Microsoft OAuth2 authorization URL. */
export function getMicrosoftAuthUrl(practiceId: string): string {
  const tenantId = getTenantId();
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES,
    response_mode: "query",
    prompt: "consent",
    state: practiceId,
  });
  return `${MICROSOFT_AUTH_URL}/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token?: string;
}> {
  const tenantId = getTenantId();
  const res = await fetch(
    `${MICROSOFT_AUTH_URL}/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri(),
        grant_type: "authorization_code",
        scope: SCOPES,
      }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    logger.error("[microsoft] Token exchange failed", { error: err });
    throw new Error(`Microsoft token exchange failed: ${err}`);
  }
  return res.json();
}

/** Refresh an expired access token. */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const tenantId = getTenantId();
  const res = await fetch(
    `${MICROSOFT_AUTH_URL}/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        scope: SCOPES,
      }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    logger.error("[microsoft] Token refresh failed", { error: err });
    throw new Error(`Microsoft token refresh failed: ${err}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Generic Graph API caller
// ---------------------------------------------------------------------------

export interface GraphResponse<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: T;
}

/** Make a request to the Microsoft Graph API. */
export async function graphRequest<T = Record<string, unknown>>(
  endpoint: string,
  token: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: Record<string, unknown>,
): Promise<GraphResponse<T>> {
  const url = endpoint.startsWith("http") ? endpoint : `${GRAPH_API}${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // DELETE often returns 204 No Content
  if (res.status === 204) {
    return { ok: true, status: 204, data: {} as T };
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    logger.error("[microsoft] Graph API error", {
      endpoint,
      status: String(res.status),
      error: JSON.stringify(data),
    });
  }

  return { ok: res.ok, status: res.status, data: data as T };
}

// ---------------------------------------------------------------------------
// User profile helper
// ---------------------------------------------------------------------------

export interface MicrosoftUserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

/** Fetch the authenticated user's profile from Graph API. */
export async function getMicrosoftUserProfile(
  accessToken: string,
): Promise<MicrosoftUserProfile> {
  const result = await graphRequest<MicrosoftUserProfile>("/me", accessToken);
  if (!result.ok) {
    throw new Error(`Failed to fetch Microsoft user profile (${result.status})`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Integration config helpers — stored as JSON in Practice.integrations
// ---------------------------------------------------------------------------

export interface MicrosoftIntegration {
  microsoftAccessToken: string;
  microsoftRefreshToken: string;
  microsoftEmail: string;
  microsoftDisplayName: string;
  microsoftConnectedAt: string;
  microsoftTokenExpiry: string; // ISO date
  microsoftCalendarSync: boolean;
  microsoftTeamsNotifications: boolean;
}

/** Parse the integrations JSON field from a Practice row. */
export function parseIntegrations(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

/** Get Microsoft-specific config from integrations JSON. Returns null if not connected. */
export function getMicrosoftConfig(
  integrations: Record<string, unknown>,
): MicrosoftIntegration | null {
  if (!integrations.microsoftAccessToken) return null;
  return {
    microsoftAccessToken: (integrations.microsoftAccessToken as string) ?? "",
    microsoftRefreshToken: (integrations.microsoftRefreshToken as string) ?? "",
    microsoftEmail: (integrations.microsoftEmail as string) ?? "",
    microsoftDisplayName: (integrations.microsoftDisplayName as string) ?? "",
    microsoftConnectedAt: (integrations.microsoftConnectedAt as string) ?? "",
    microsoftTokenExpiry: (integrations.microsoftTokenExpiry as string) ?? "",
    microsoftCalendarSync: (integrations.microsoftCalendarSync as boolean) ?? false,
    microsoftTeamsNotifications: (integrations.microsoftTeamsNotifications as boolean) ?? false,
  };
}

/** Check if the access token is expired (with 5-minute buffer). */
export function isTokenExpired(expiryIso: string): boolean {
  if (!expiryIso) return true;
  const expiry = new Date(expiryIso).getTime();
  return Date.now() > expiry - 5 * 60 * 1000;
}

/** Get a valid access token, refreshing if needed. Returns updated integrations JSON + token. */
export async function getValidAccessToken(
  integrations: Record<string, unknown>,
): Promise<{
  accessToken: string;
  updatedIntegrations: Record<string, unknown>;
  didRefresh: boolean;
}> {
  const ms = getMicrosoftConfig(integrations);
  if (!ms) throw new Error("Microsoft 365 not connected");

  if (!isTokenExpired(ms.microsoftTokenExpiry)) {
    return {
      accessToken: ms.microsoftAccessToken,
      updatedIntegrations: integrations,
      didRefresh: false,
    };
  }

  // Refresh the token
  const refreshed = await refreshAccessToken(ms.microsoftRefreshToken);
  const expiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  const updated = {
    ...integrations,
    microsoftAccessToken: refreshed.access_token,
    microsoftRefreshToken: refreshed.refresh_token,
    microsoftTokenExpiry: expiry,
  };

  return {
    accessToken: refreshed.access_token,
    updatedIntegrations: updated,
    didRefresh: true,
  };
}
