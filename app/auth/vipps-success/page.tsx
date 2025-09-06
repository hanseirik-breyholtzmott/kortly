"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VippsSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processVippsUser = async () => {
      try {
        // Get user data from cookie
        const response = await fetch("/api/auth/vipps/user-data");

        if (!response.ok) {
          throw new Error("Failed to get user data");
        }

        const data = await response.json();
        console.log("User data received:", data);

        // Wait a moment for the session to be established by the magic link
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if user is authenticated with Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("Session check result:", {
          session: !!session,
          error: sessionError,
          sessionDetails: session
            ? {
                userId: session.user?.id,
                email: session.user?.email,
                expiresAt: session.expires_at,
                accessToken: session.access_token ? "present" : "missing",
                refreshToken: session.refresh_token ? "present" : "missing",
              }
            : null,
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
        }

        if (session) {
          console.log("User is authenticated with Supabase:", session.user);

          // Store the user data in localStorage for the auth system
          localStorage.setItem(
            "pokemon-user",
            JSON.stringify({
              id: session.user.id,
              username:
                session.user.user_metadata?.display_name ||
                session.user.email?.split("@")[0] ||
                "user",
              email: session.user.email,
              cardsCount: 0,
              joinedAt: session.user.created_at
                ? new Date(session.user.created_at).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              // Additional data from metadata
              birthDate: session.user.user_metadata?.birth_date,
              address: session.user.user_metadata?.address,
              phoneNumber: session.user.phone,
              givenName: session.user.user_metadata?.given_name,
              familyName: session.user.user_metadata?.family_name,
              middleName: session.user.user_metadata?.middle_name,
              nin: session.user.user_metadata?.nin,
            })
          );

          setStatus("success");

          // Redirect to the dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          // If still no session, try one more time with a longer wait
          console.log("No session found, waiting longer and retrying...");

          setTimeout(async () => {
            const {
              data: { session: retrySession },
            } = await supabase.auth.getSession();

            if (retrySession) {
              console.log("Session found on retry, redirecting to dashboard");
              router.push("/dashboard");
            } else {
              console.log("Still no session, redirecting to dashboard anyway");
              router.push("/dashboard");
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Error processing Vipps user:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setStatus("error");
      }
    };

    processVippsUser();
  }, [router]);

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Processing your Vipps login...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Login Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Login Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Welcome! Redirecting you to the app...
        </p>
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
