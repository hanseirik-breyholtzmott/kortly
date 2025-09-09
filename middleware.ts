import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Define protected routes that require authentication
const protectedRoutes = ["/profile", "/admin", "/dashboard"];

// Define public routes that don't require authentication
const publicRoutes = ["/", "/auth", "/api/auth"];

// Define admin-only routes
const adminRoutes = [];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create a Supabase client configured to use cookies
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a protected route and there's no session, redirect to home
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (
    session &&
    pathname.startsWith("/auth") &&
    pathname !== "/auth/vipps-success"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Handle Vipps OAuth callback
  if (pathname === "/auth/callback") {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("error", error);
      return NextResponse.redirect(redirectUrl);
    }

    if (code && state) {
      // Let the callback route handler process the OAuth flow
      return res;
    }
  }

  // Handle Vipps success page - ensure user data is available
  if (pathname === "/auth/vipps-success") {
    const vippsUserData = req.cookies.get("vipps_user_data");
    if (!vippsUserData) {
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("error", "no_user_data");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Add security headers
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    res.headers.set("Access-Control-Allow-Origin", req.nextUrl.origin);
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
