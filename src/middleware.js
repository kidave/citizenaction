import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const updateSession = () => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });

            response = NextResponse.next({ request });

            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    return supabase;
  };

  // 1. Check Maintenance Mode first.
  const url = request.nextUrl.clone();
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (isMaintenanceMode) {
    const isStaticAsset =
      url.pathname.startsWith("/_next") || url.pathname.includes(".");
    const isMaintenancePage = url.pathname === "/maintenance";

    if (!isStaticAsset && !isMaintenancePage) {
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url, { status: 503 });
    }

    if (isMaintenancePage) return response;
  }

  // 2. Refresh and verify the cookie-based Supabase session.
  const supabase = updateSession();
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  // 3. Protect /manage/* routes.
  if (request.nextUrl.pathname.startsWith("/manage") && !claims) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
