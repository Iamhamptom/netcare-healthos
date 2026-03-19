/**
 * Gmail API helper — REST-based (no googleapis npm package)
 *
 * Env vars required:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_APP_URL
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

function redirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`;
}

// ---------------------------------------------------------------------------
// OAuth helpers
// ---------------------------------------------------------------------------

/** Generate the Google OAuth2 authorization URL. */
export function getGmailAuthUrl(practiceId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: practiceId,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Exchange an authorization code for tokens. */
export async function exchangeGmailCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }
  return res.json();
}

/** Refresh an expired access token. */
export async function refreshGmailToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Gmail message helpers
// ---------------------------------------------------------------------------

/** Fetch a list of message IDs matching an optional query. */
export async function fetchGmailMessages(
  accessToken: string,
  query?: string,
  maxResults: number = 20,
): Promise<{ messages: { id: string; threadId: string }[]; resultSizeEstimate: number }> {
  const params = new URLSearchParams({ maxResults: String(maxResults) });
  if (query) params.set("q", query);

  const res = await fetch(`${GMAIL_API}/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail list failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  return {
    messages: data.messages ?? [],
    resultSizeEstimate: data.resultSizeEstimate ?? 0,
  };
}

export interface GmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  snippet: string;
}

/** Get a single full message and parse it into a friendly shape. */
export async function getGmailMessage(
  accessToken: string,
  messageId: string,
): Promise<GmailMessage> {
  const res = await fetch(`${GMAIL_API}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail get message failed (${res.status}): ${err}`);
  }
  const data = await res.json();

  const headers: Record<string, string> = {};
  for (const h of data.payload?.headers ?? []) {
    const key = (h.name as string).toLowerCase();
    if (["from", "to", "subject", "date"].includes(key)) {
      headers[key] = h.value as string;
    }
  }

  // Extract body — prefer text/plain, fall back to text/html
  let body = "";
  const parts = data.payload?.parts ?? [];
  if (parts.length > 0) {
    const textPart = parts.find((p: { mimeType: string }) => p.mimeType === "text/plain");
    const htmlPart = parts.find((p: { mimeType: string }) => p.mimeType === "text/html");
    const chosen = textPart ?? htmlPart;
    if (chosen?.body?.data) {
      body = base64UrlDecode(chosen.body.data);
    }
  } else if (data.payload?.body?.data) {
    body = base64UrlDecode(data.payload.body.data);
  }

  return {
    id: data.id,
    from: headers.from ?? "",
    to: headers.to ?? "",
    subject: headers.subject ?? "(no subject)",
    date: headers.date ?? "",
    body,
    snippet: data.snippet ?? "",
  };
}

/** Send an email via Gmail API. */
export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  from?: string,
): Promise<{ id: string; threadId: string }> {
  const fromLine = from ? `From: ${from}\r\n` : "";
  const raw = [
    fromLine,
    `To: ${to}\r\n`,
    `Subject: ${subject}\r\n`,
    `Content-Type: text/html; charset=UTF-8\r\n`,
    `\r\n`,
    body,
  ].join("");

  const encoded = base64UrlEncode(raw);

  const res = await fetch(`${GMAIL_API}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail send failed (${res.status}): ${err}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Integration config helpers — stored as JSON in Practice.integrations
// ---------------------------------------------------------------------------

export interface GmailIntegration {
  gmailAccessToken: string;
  gmailRefreshToken: string;
  gmailEmail: string;
  gmailConnectedAt: string;
  gmailTokenExpiry: string; // ISO date
}

/** Parse the integrations JSON field from a Practice row. */
export function parseIntegrations(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

/** Get gmail-specific config from integrations JSON. Returns null if not connected. */
export function getGmailConfig(integrations: Record<string, unknown>): GmailIntegration | null {
  if (!integrations.gmailAccessToken) return null;
  return {
    gmailAccessToken: (integrations.gmailAccessToken as string) ?? "",
    gmailRefreshToken: (integrations.gmailRefreshToken as string) ?? "",
    gmailEmail: (integrations.gmailEmail as string) ?? "",
    gmailConnectedAt: (integrations.gmailConnectedAt as string) ?? "",
    gmailTokenExpiry: (integrations.gmailTokenExpiry as string) ?? "",
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
): Promise<{ accessToken: string; updatedIntegrations: Record<string, unknown>; didRefresh: boolean }> {
  const gmail = getGmailConfig(integrations);
  if (!gmail) throw new Error("Gmail not connected");

  if (!isTokenExpired(gmail.gmailTokenExpiry)) {
    return { accessToken: gmail.gmailAccessToken, updatedIntegrations: integrations, didRefresh: false };
  }

  // Refresh the token
  const refreshed = await refreshGmailToken(gmail.gmailRefreshToken);
  const expiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  const updated = {
    ...integrations,
    gmailAccessToken: refreshed.access_token,
    gmailTokenExpiry: expiry,
  };

  return { accessToken: refreshed.access_token, updatedIntegrations: updated, didRefresh: true };
}

// ---------------------------------------------------------------------------
// base64url utilities
// ---------------------------------------------------------------------------

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(encoded: string): string {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf-8");
}
