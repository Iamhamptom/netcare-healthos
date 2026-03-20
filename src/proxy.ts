// Next.js 16 proxy.ts — replaces middleware.ts
// Runs on Node.js runtime (not Edge), supports full Node.js APIs.
// Export function must be named `proxy` (not `middleware`).
// See: https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

const isDemoMode = process.env.DEMO_MODE === "true";

export async function proxy(request: NextRequest) {
  // In demo mode, allow all access to dashboard
  if (isDemoMode) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isInvestor = pathname.startsWith("/investor");
  const isGPDashboard = pathname.startsWith("/gp/dashboard");

  // Protected API routes (return 401 instead of redirect)
  const isProtectedApi = pathname.startsWith("/api/claims") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/invoices") ||
    pathname.startsWith("/api/payments");

  if (isProtectedApi) {
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyToken(token);
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  if (isDashboard || isAdmin || isInvestor || isGPDashboard) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const session = await verifyToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  if (isAuthPage && token) {
    const session = await verifyToken(token);
    if (session) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/admin/:path*", "/investor/:path*", "/gp/dashboard/:path*",
    "/login", "/register",
    "/api/claims/:path*", "/api/admin/:path*", "/api/invoices/:path*", "/api/payments/:path*",
  ],
};
