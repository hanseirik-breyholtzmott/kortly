"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Grid3X3, Target, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileTab } from "@/components/profile-tab";
import { CardUploadsTab } from "@/components/card-uploads-tab";
import { CardCollectionTab } from "@/components/card-collection-tab";
import { SupabaseTest } from "@/components/supabase-test";

interface User {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: {
    given_name?: string;
    display_name?: string;
  };
  app_metadata?: {
    provider?: string;
  };
}

interface DashboardClientProps {
  user: User;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const logout = async () => {
    try {
      setIsLoggingOut(true);

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
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
      // Force redirect to login page if logout fails
      window.location.href = "/login";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-aqua-mint-50 to-mystic-vault-50"
      style={{
        background:
          "linear-gradient(to bottom right, var(--aqua-mint-50), var(--mystic-vault-50))",
      }}
    >
      {/* Header */}
      <header
        className="bg-white/90 backdrop-blur border-b sticky top-0 z-50"
        style={{ borderColor: "var(--aqua-mint-200)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--mystic-vault-800)" }}
              >
                Kortly Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--aqua-mint-500)" }}
                ></div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--aqua-mint-700)" }}
                >
                  {user.user_metadata?.given_name ||
                    user.user_metadata?.display_name ||
                    user.email ||
                    "Unknown User"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logger ut..." : "Logg ut"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="mb-8 bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle
              className="text-xl flex items-center gap-2"
              style={{ color: "var(--mystic-vault-800)" }}
            >
              <Target className="h-5 w-5" />
              Velkommen tilbake!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Brukerdetaljer
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {user.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Bruker ID:</span> {user.id}
                    </p>
                    <p>
                      <span className="font-medium">Opprettet:</span>{" "}
                      {new Date(user.created_at).toISOString().split("T")[0]}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Økt Info</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span style={{ color: "var(--aqua-mint-600)" }}>
                        Aktiv
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Leverandør:</span>{" "}
                      {user.app_metadata?.provider || "Ukjent"}
                    </p>
                  </div>
                </div>
              </div>

              {/* User JSON Data */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Rå Brukerdata</h3>
                  <Button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(user, null, 2))
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Kopier
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                  <pre className="text-xs text-gray-700">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList
            className="grid w-full grid-cols-4 mb-8"
            style={{ backgroundColor: "var(--holo-gloss)", opacity: 0.9 }}
          >
            <TabsTrigger value="profile" className="gap-2">
              <Target className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="uploads" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Kortopplastinger
            </TabsTrigger>
            <TabsTrigger value="collection" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Samling
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <Target className="h-4 w-4" />
              Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>

          <TabsContent value="uploads">
            <CardUploadsTab user={user} />
          </TabsContent>

          <TabsContent value="collection">
            <CardCollectionTab user={user} />
          </TabsContent>

          <TabsContent value="test">
            <SupabaseTest user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
