import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          },
        },
      }
    );

    const userData = await request.json();

    // Create or update the Supabase auth user with phone number
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: userData.email,
        phone: userData.phone_number || userData.phone,
        user_metadata: {
          vipps_id: userData.sub,
          display_name: userData.name,
          given_name: userData.given_name || userData.name, // Use display name as first name
          family_name: userData.family_name,
          middle_name: userData.middle_name,
          birth_date: userData.birth_date,
          address: userData.address,
          nin: userData.nin,
        },
        app_metadata: {
          provider: "vipps",
          providers: ["vipps"],
        },
      });

    if (authError) {
      console.log(
        "Auth user creation failed, trying to update existing user:",
        authError
      );
      // If user already exists, try to update their metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userData.sub,
        {
          phone: userData.phone_number || userData.phone,
          user_metadata: {
            display_name: userData.name,
            given_name: userData.given_name || userData.name,
            family_name: userData.family_name,
            middle_name: userData.middle_name,
            birth_date: userData.birth_date,
            address: userData.address,
            nin: userData.nin,
          },
        }
      );

      if (updateError) {
        console.error("Failed to update auth user:", updateError);
        return NextResponse.json(
          { error: "Failed to update auth user" },
          { status: 500 }
        );
      }
    }

    // All user data is stored in Supabase auth user metadata, no need for separate profiles table
    console.log("User data successfully stored in Supabase auth user metadata");

    return NextResponse.json({
      success: true,
      authUser: authUser,
    });
  } catch (error) {
    console.error("Error processing Vipps user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
