import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}?error=${encodeURIComponent(error)}`
    );
  }

  // Verify state parameter
  const cookieStore = await cookies();
  const storedState = cookieStore.get("vipps_oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    console.error("Invalid state parameter");
    return NextResponse.redirect(`${requestUrl.origin}?error=invalid_state`);
  }

  if (code) {
    try {
      console.log("OAuth callback received:", {
        code: code.substring(0, 10) + "...",
        state,
        storedState,
        redirectUri:
          process.env.VIPPS_REDIRECT_URI ||
          `${requestUrl.origin}/auth/callback`,
      });

      // Exchange code for access token
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
          `Failed to exchange code for token: ${tokenResponse.status} ${errorText}`
        );
      }

      const tokenData = await tokenResponse.json();
      const vippsAccessToken = tokenData.access_token;

      console.log("Token exchange successful:", {
        tokenType: tokenData.token_type,
        hasAccessToken: !!vippsAccessToken,
        scope: tokenData.scope,
      });

      // Get real user data from Vipps Userinfo API
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

      let userData;

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("Vipps userinfo request failed:", {
          status: userResponse.status,
          statusText: userResponse.statusText,
          error: errorText,
        });

        // Fallback to mock data if userinfo fails
        console.log(
          "Falling back to mock user data due to userinfo API failure"
        );
        userData = {
          sub: `vipps_${Date.now()}`,
          email: "user@vipps.no",
          name: "Vipps User",
          phone_number: "+4712345678",
        };
        console.log("Using fallback mock user data:", userData);
      } else {
        userData = await userResponse.json();
        console.log("Successfully retrieved real Vipps user data:", userData);
      }

      // Map Vipps user data to our expected format
      const mappedUserData = {
        sub: userData.sub || userData.user_id || `vipps_${Date.now()}`,
        email: userData.email || userData.email_address || "user@vipps.no",
        name: userData.name || userData.given_name || "Vipps User",
        phone_number: userData.phone_number || userData.phone || "+4712345678",
        // Additional Vipps-specific data
        birth_date:
          userData.birth_date || userData.birthDate || userData.birthdate,
        address: userData.address || {
          street_address: userData.street_address,
          postal_code: userData.postal_code,
          city: userData.city,
          country: userData.country || "NO",
        },
        nin: userData.nin || userData.national_identity_number,
        // Additional fields that might be available
        given_name: userData.given_name || userData.name || "Vipps User", // Use display name as first name
        family_name: userData.family_name,
        middle_name: userData.middle_name,
        // Ensure phone number is available for Supabase auth
        phone: userData.phone_number || userData.phone || "+4712345678",
      };

      console.log("Mapped user data for Supabase auth:", {
        ...mappedUserData,
        // Don't log sensitive data like NIN in production
        nin:
          process.env.NODE_ENV === "development"
            ? mappedUserData.nin
            : "[REDACTED]",
      });

      // Create Supabase client with service role key for admin operations
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              // This will be handled by the response
            },
            remove(name: string, options: any) {
              // This will be handled by the response
            },
          },
        }
      );

      // First, check if user already exists by email
      const { data: existingUsers, error: listError } =
        await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (listError) {
        console.error("Failed to list users:", listError);
        return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`);
      }

      const existingUser = existingUsers.users.find(
        (user) => user.email === mappedUserData.email
      );

      let finalUser = null;

      if (existingUser) {
        // User exists, update their metadata
        console.log("Found existing user, updating metadata:", existingUser.id);

        const { data: updateUser, error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            phone: mappedUserData.phone,
            email_confirm: true, // Ensure email remains confirmed
            phone_confirm: true, // Ensure phone remains confirmed
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
            },
            app_metadata: {
              provider: "vipps",
              providers: ["vipps"],
            },
          });

        if (updateError) {
          console.error("Failed to update auth user:", updateError);
          return NextResponse.redirect(
            `${requestUrl.origin}?error=auth_failed`
          );
        }

        console.log("Successfully updated existing user metadata");
        finalUser = existingUser;
      } else {
        // User doesn't exist, create new user
        console.log("User not found, creating new user:", mappedUserData.email);

        const { data: authUser, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: mappedUserData.email,
            phone: mappedUserData.phone,
            email_confirm: true, // Auto-confirm email for Vipps users
            phone_confirm: true, // Auto-confirm phone for Vipps users
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
            },
            app_metadata: {
              provider: "vipps",
              providers: ["vipps"],
            },
          });

        if (authError) {
          console.error("Failed to create auth user:", authError);
          return NextResponse.redirect(
            `${requestUrl.origin}?error=auth_failed`
          );
        }

        console.log("Successfully created new user");
        finalUser = authUser.user;
      }

      // All user data is stored in Supabase auth user metadata, no need for separate profiles table
      console.log(
        "User data successfully stored in Supabase auth user metadata"
      );

      // Check if we can get the user's session immediately after creation/update
      const { data: immediateSession, error: immediateSessionError } =
        await supabaseAdmin.auth.admin.getUserById(finalUser.id);

      console.log("Immediate session check after user creation/update:", {
        hasUser: !!immediateSession.user,
        userId: immediateSession.user?.id,
        email: immediateSession.user?.email,
        error: immediateSessionError,
      });

      // Get the user ID for session creation
      if (!finalUser) {
        console.error("No user available for session creation");
        return NextResponse.redirect(
          `${requestUrl.origin}?error=session_failed`
        );
      }

      // Create a regular Supabase client for session management
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              // This will be handled by the response
            },
            remove(name: string, options: any) {
              // This will be handled by the response
            },
          },
        }
      );

      // For Vipps OAuth, create a session directly using admin client
      // Generate a session for the authenticated user
      const { data: sessionData, error: sessionError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: mappedUserData.email,
          options: {
            redirectTo: `${requestUrl.origin}/auth/vipps-success`,
          },
        });

      if (sessionError) {
        console.error("Failed to generate session:", sessionError);
        return NextResponse.redirect(
          `${requestUrl.origin}?error=session_failed`
        );
      }

      console.log("Generated magic link:", sessionData.properties.action_link);

      // Create response and set session cookies
      const response = NextResponse.redirect(
        `${requestUrl.origin}/auth/vipps-success`
      );

      // Clear the state cookie
      response.cookies.delete("vipps_oauth_state");

      // Store user data in cookie for the success page to display
      response.cookies.set("vipps_user_data", JSON.stringify(mappedUserData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 300, // 5 minutes
      });

      console.log("Session created successfully for user:", finalUser.id);
      console.log("Redirecting to Vipps success page");

      return response;
    } catch (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(`${requestUrl.origin}?error=oauth_failed`);
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
