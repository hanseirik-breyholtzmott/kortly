"use client";

import { useAuth } from "@/hooks/use-auth";
import { VippsLoginButton } from "@/components/vipps-login-button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) {
    return null; // Will redirect via useEffect
  }

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
              Velkommen Trener
            </CardTitle>
            <CardDescription>
              Logg inn med Vipps for å starte din samlingsreise
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <VippsLoginButton />

            {/* Additional Info */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Ved å logge inn godtar du våre{" "}
                <a
                  href="#"
                  className="hover:underline"
                  style={{ color: "var(--aqua-mint-600)" }}
                >
                  Tjenestevilkår
                </a>{" "}
                og{" "}
                <a
                  href="#"
                  className="hover:underline"
                  style={{ color: "var(--aqua-mint-600)" }}
                >
                  Personvernregler
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
