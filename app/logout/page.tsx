"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<unknown>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();

        // First check if there's a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setLoading(false);
          return;
        }

        if (!session) {
          console.log("No active session found");
          setLoading(false);
          return;
        }

        // If session exists, get the user details
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          setLoading(false);
          return;
        }

        if (!user) {
          console.log("No user found in session");
          setLoading(false);
          return;
        }

        setUser(user);
      } catch (err) {
        console.error("Error checking user:", err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);

      // Call server-side logout route to clear HttpOnly cookies
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Logout failed");
      }

      // Also sign out from client-side Supabase
      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear any localStorage/sessionStorage items
      localStorage.clear();
      sessionStorage.clear();

      // Wait a moment for everything to clear
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to login page after successful logout
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during logout"
      );
      setIsLoggingOut(false);
    }
  };

  const handleManualLogout = () => {
    handleLogout();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(to bottom right, var(--aqua-mint-50), var(--mystic-vault-50))",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--mystic-vault-600)" }}
          ></div>
          <p style={{ color: "var(--mystic-vault-700)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't redirect immediately if no user - show logout option anyway
  // The user might have been cleared by global auth state

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(to bottom right, var(--aqua-mint-50), var(--mystic-vault-50))",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--mystic-vault-800)" }}
          >
            Kortly
          </h1>
          <p style={{ color: "var(--mystic-vault-700)" }}>Samle dem alle!</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle
              className="text-2xl"
              style={{ color: "var(--mystic-vault-800)" }}
            >
              {isLoggingOut ? "Logger ut..." : "Logg ut"}
            </CardTitle>
            <CardDescription>
              {isLoggingOut
                ? "Vennligst vent mens vi logger deg ut..."
                : "Er du sikker på at du vil logge ut?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isLoggingOut && (
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderColor: "var(--mystic-vault-600)" }}
                ></div>
                <p style={{ color: "var(--mystic-vault-700)" }}>
                  Rydder opp i din sesjon...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Utloggingsfeil
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={handleManualLogout}
                        variant="destructive"
                        size="sm"
                      >
                        Prøv igjen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isLoggingOut && (
              <div className="space-y-4">
                <Button
                  onClick={handleManualLogout}
                  className="w-full"
                  style={{ backgroundColor: "var(--mystic-vault-600)" }}
                  disabled={isLoggingOut}
                >
                  Logg ut
                </Button>

                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="w-full"
                  disabled={isLoggingOut}
                >
                  Avbryt
                </Button>
              </div>
            )}

            {isLoggingOut && (
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderColor: "var(--mystic-vault-600)" }}
                ></div>
                <p style={{ color: "var(--mystic-vault-700)" }}>
                  Rydder opp i din sesjon...
                </p>
              </div>
            )}

            <div
              className="mt-6 text-center text-sm"
              style={{ color: "var(--mystic-vault-600)" }}
            >
              <p>Du vil bli omdirigert til innloggingssiden etter utlogging.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
