// Next.js 16 proxy.ts — replaces middleware.ts
// Runs on Node.js runtime (not Edge), supports full Node.js APIs.
// Export function must be named `proxy` (not `middleware`).
// See: https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

const isDemoMode = process.env.DEMO_MODE === "true";

export async function proxy(request: NextRequest) {
  // White-label brand persistence: ?brand= param sets a cookie so the brand
  // sticks across all page navigations without needing ?brand= on every link.
  const brandParam = request.nextUrl.searchParams.get("brand");
  const brandCookie = request.cookies.get("healthos-brand")?.value;
  const activeBrand = brandParam || brandCookie || null;

  const forwardUrl = () => {
    const res = NextResponse.next();
    res.headers.set("x-url", request.url);
    // Persist brand in cookie if set via query param
    if (activeBrand) {
      res.headers.set("x-brand", activeBrand);
      if (brandParam) {
        res.cookies.set("healthos-brand", brandParam, {
          path: "/",
          maxAge: 60 * 60 * 24, // 24 hours
          sameSite: "lax",
        });
      }
    }
    return res;
  };

  // In demo mode, allow all access to dashboard
  if (isDemoMode) return forwardUrl();

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

  return forwardUrl();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|brands|images|.*\\.png$|.*\\.ico$).*)",
  ],
};
