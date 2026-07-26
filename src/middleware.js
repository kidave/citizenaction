import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const url = req.nextUrl.clone();

  // 1. Check Maintenance Mode first
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (isMaintenanceMode) {
    // Avoid infinite loops: let static assets, api routes, and the maintenance page load
    const isStaticAsset =
      url.pathname.startsWith("/_next") || url.pathname.includes(".");
    const isMaintenancePage = url.pathname === "/maintenance";

    if (!isStaticAsset && !isMaintenancePage) {
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url, {
        status: 503, // Returns proper HTTP status for SEO/bots
      });
    }
    // If it is a static asset or the maintenance page itself, let it pass through
    if (isMaintenancePage) return res;
  }

  // 2. Existing Supabase Session & Route Protection Logic
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect /manage/* routes
  if (req.nextUrl.pathname.startsWith("/manage")) {
    if (!session) {
      const redirectUrl = new URL("/auth", req.url);
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// 3. Updated Matcher: Strips out assets but matches ALL normal page paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
