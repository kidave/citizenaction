import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
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

export const config = {
  matcher: ["/manage/:path*"],
};