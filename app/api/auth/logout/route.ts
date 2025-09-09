import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get the Supabase project reference from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const projectRef = supabaseUrl?.split("//")[1]?.split(".")[0];

    // Clear all possible Supabase cookies
    const cookieNames = [
      "sb-access-token",
      "sb-refresh-token",
      "sb-provider-token",
      "sb-provider-refresh-token",
    ];

    if (projectRef) {
      cookieNames.push(
        `sb-${projectRef}-auth-token`,
        `sb-${projectRef}-auth-token.0`,
        `sb-${projectRef}-auth-token.1`,
        `sb-${projectRef}-auth-token-code-verifier`,
        `sb-${projectRef}-auth-token-code-challenge`
      );
    }

    // Clear each cookie with different path and domain combinations
    cookieNames.forEach((cookieName) => {
      // Clear with different path and domain combinations
      cookieStore.delete(cookieName);
      cookieStore.set(cookieName, "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    });

    // Also try to clear any cookies that start with 'sb-'
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        cookieStore.delete(cookie.name);
        cookieStore.set(cookie.name, "", {
          expires: new Date(0),
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
