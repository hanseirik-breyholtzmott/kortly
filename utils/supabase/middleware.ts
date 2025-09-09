import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function createSupabaseMiddleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

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

  // If there's a session, refresh it to ensure it's valid
  if (session) {
    await supabase.auth.getUser();
  }

  return { supabase, res };
}

export async function refreshSession(req: NextRequest) {
  const { res, supabase } = await createSupabaseMiddleware(req);

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { session, supabase, res };
}

export async function getUser(req: NextRequest) {
  const { session, supabase } = await refreshSession(req);

  if (!session) {
    return { user: null, supabase };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error);
    return { user: null, supabase };
  }

  return { user, supabase };
}
