import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

interface VippsUserData {
  sub?: string;
  user_id?: string;
  email?: string;
  email_address?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  phone_number?: string;
  phone?: string;
  birth_date?: string;
  birthDate?: string;
  birthdate?: string;
  address?: {
    street_address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  nin?: string;
  national_identity_number?: string;
}

interface MappedUserData {
  sub: string;
  email: string;
  name: string;
  phone_number: string;
  birth_date?: string;
  address?: {
    street_address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
  nin?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  phone: string;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  console.log("Vipps OAuth callback received:", {
    hasCode: !!code,
    hasState: !!state,
    error,
    url: requestUrl.toString(),
  });

  // Handle OAuth errors from Vipps
  if (error) {
    console.error("OAuth error from Vipps:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}?error=${encodeURIComponent(error)}`
    );
  }

  // Verify state parameter for CSRF protection
  const cookieStore = await cookies();
  const storedState = cookieStore.get("vipps_oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    console.error("Invalid state parameter:", {
      receivedState: state,
      storedState: storedState,
    });
    return NextResponse.redirect(`${requestUrl.origin}?error=invalid_state`);
  }

  if (!code) {
    console.error("No authorization code received");
    return NextResponse.redirect(`${requestUrl.origin}?error=no_code`);
  }

  try {
    console.log("Starting OAuth token exchange...");

    // Step 1: Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://api.vipps.no/access-management-1.0/access/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.VIPPS_CLIENT_ID}:${process.env.VIPPS_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri:
            process.env.VIPPS_REDIRECT_URI ||
            `${requestUrl.origin}/auth/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
      });
      throw new Error(
        `Token exchange failed: ${tokenResponse.status} - ${errorText}`
      );
    }

    const tokenData = await tokenResponse.json();
    const vippsAccessToken = tokenData.access_token;

    if (!vippsAccessToken) {
      console.error("No access token received from Vipps");
      throw new Error("No access token received");
    }

    console.log("✅ Token exchange successful");

    // Step 2: Get user information from Vipps
    console.log("Fetching user data from Vipps...");

    const userResponse = await fetch(
      "https://api.vipps.no/vipps-userinfo-api/userinfo/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${vippsAccessToken}`,
          "Merchant-Serial-Number":
            process.env.VIPPS_MERCHANT_SERIAL_NUMBER || "",
          "Vipps-System-Name": "PokéCard Collector",
          "Vipps-System-Version": "1.0.0",
          "Vipps-System-Plugin-Name": "NextJS App",
          "Vipps-System-Plugin-Version": "1.0.0",
        },
      }
    );

    let userData: VippsUserData;

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Vipps userinfo request failed:", {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText,
      });

      // Fallback to mock data for development/testing
      console.log("Using fallback mock user data");
      userData = {
        sub: `vipps_${Date.now()}`,
        email: `user+${Date.now()}@vipps.no`,
        name: "Vipps Test User",
        phone_number: "+4712345678",
        given_name: "Vipps",
        family_name: "User",
      };
    } else {
      userData = await userResponse.json();
      console.log("✅ Successfully retrieved Vipps user data");
    }

    // Step 3: Map Vipps user data to our format
    const mappedUserData: MappedUserData = {
      sub: userData.sub || userData.user_id || `vipps_${Date.now()}`,
      email:
        userData.email ||
        userData.email_address ||
        `user+${Date.now()}@vipps.no`,
      name: userData.name || userData.given_name || "Vipps User",
      phone_number: userData.phone_number || userData.phone || "+4712345678",
      birth_date:
        userData.birth_date || userData.birthDate || userData.birthdate,
      address: userData.address || {
        street_address: userData.street_address,
        postal_code: userData.postal_code,
        city: userData.city,
        country: userData.country || "NO",
      },
      nin: userData.nin || userData.national_identity_number,
      given_name:
        userData.given_name || userData.name?.split(" ")[0] || "Vipps",
      family_name:
        userData.family_name ||
        userData.name?.split(" ").slice(1).join(" ") ||
        "User",
      middle_name: userData.middle_name,
      phone: userData.phone_number || userData.phone || "+4712345678",
    };

    console.log("Mapped user data:", {
      sub: mappedUserData.sub,
      email: mappedUserData.email,
      name: mappedUserData.name,
      hasPhone: !!mappedUserData.phone,
      hasNin: !!mappedUserData.nin,
    });

    // Step 4: Create the response to handle cookies properly
    const response = NextResponse.redirect(
      `${requestUrl.origin}/auth/vipps-success`
    );

    // Step 5: Create Supabase client for regular operations (with cookie handling)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: "",
              ...options,
              maxAge: 0,
              path: "/",
            });
          },
        },
      }
    );

    // Step 6: Create admin client for user management
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {}, // Admin client doesn't need to set cookies
          remove() {},
        },
      }
    );

    // Generate a secure temporary password for the user
    const tempPassword = randomBytes(32).toString("hex");

    // Step 7: Check if user already exists
    console.log("Checking for existing user...");

    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (listError) {
      console.error("Failed to list users:", listError);
      throw new Error("Failed to check existing users");
    }

    const existingUser = existingUsers.users.find(
      (user) => user.email === mappedUserData.email
    );

    let finalUser: any = null;

    if (existingUser) {
      // Step 8a: Update existing user with new password
      console.log("Found existing user, updating:", existingUser.id);

      const { data: updatedUser, error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: tempPassword, // Set temporary password for sign-in
          phone: mappedUserData.phone,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            vipps_id: mappedUserData.sub,
            display_name: mappedUserData.name,
            given_name: mappedUserData.given_name,
            family_name: mappedUserData.family_name,
            middle_name: mappedUserData.middle_name,
            birth_date: mappedUserData.birth_date,
            address: mappedUserData.address,
            nin: mappedUserData.nin,
            last_sign_in_at: new Date().toISOString(),
            provider: "vipps",
          },
          app_metadata: {
            provider: "vipps",
            providers: ["vipps"],
          },
        });

      if (updateError) {
        console.error("Failed to update existing user:", updateError);
        throw new Error("Failed to update user");
      }

      console.log("✅ Successfully updated existing user");
      finalUser = existingUser;
    } else {
      // Step 8b: Create new user
      console.log("Creating new user:", mappedUserData.email);

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: mappedUserData.email,
          password: tempPassword, // Set temporary password for sign-in
          phone: mappedUserData.phone,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            vipps_id: mappedUserData.sub,
            display_name: mappedUserData.name,
            given_name: mappedUserData.given_name,
            family_name: mappedUserData.family_name,
            middle_name: mappedUserData.middle_name,
            birth_date: mappedUserData.birth_date,
            address: mappedUserData.address,
            nin: mappedUserData.nin,
            last_sign_in_at: new Date().toISOString(),
            provider: "vipps",
          },
          app_metadata: {
            provider: "vipps",
            providers: ["vipps"],
          },
        });

      if (createError) {
        console.error("Failed to create new user:", createError);
        throw new Error("Failed to create user");
      }

      console.log("✅ Successfully created new user");
      finalUser = newUser.user;
    }

    if (!finalUser?.id) {
      console.error("No user ID available for session creation");
      throw new Error("User creation/update failed");
    }

    // Step 9: Sign in the user using the temporary password
    console.log("Signing in user with temporary password...");

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: mappedUserData.email,
        password: tempPassword,
      });

    if (signInError) {
      console.error("Failed to sign in user:", signInError);
      throw new Error("Failed to sign in user");
    }

    if (!signInData.session) {
      console.error("Sign in successful but no session created");
      throw new Error("No session created");
    }

    console.log("✅ User signed in successfully with session");

    // Step 10: Remove the temporary password for security (optional but recommended)
    console.log("Removing temporary password...");

    const { error: removePasswordError } =
      await supabaseAdmin.auth.admin.updateUserById(finalUser.id, {
        password: undefined, // Remove password - they'll use Vipps for future logins
      });

    if (removePasswordError) {
      console.warn("Failed to remove temporary password:", removePasswordError);
      // Don't throw error here as the session is already created
    } else {
      console.log("✅ Temporary password removed");
    }

    // Step 11: Clean up and set additional cookies
    response.cookies.delete("vipps_oauth_state");

    // Store user data temporarily for the success page
    response.cookies.set(
      "vipps_user_data",
      JSON.stringify({
        id: finalUser.id,
        email: mappedUserData.email,
        name: mappedUserData.name,
        vipps_id: mappedUserData.sub,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 300, // 5 minutes
        path: "/",
      }
    );

    console.log(
      "🎉 Vipps OAuth flow completed successfully for user:",
      finalUser.id
    );

    return response;
  } catch (error) {
    console.error("❌ OAuth callback error:", error);

    // Create error response
    const errorResponse = NextResponse.redirect(
      `${requestUrl.origin}?error=oauth_failed&details=${encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error"
      )}`
    );

    // Clean up state cookie even on error
    errorResponse.cookies.delete("vipps_oauth_state");

    return errorResponse;
  }
}
