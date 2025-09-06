"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface SessionInfo {
  session: any;
  user: any;
  error: any;
  timestamp: string;
}

// Client-side only component to avoid hydration issues
function LocalStorageDisplay() {
  const [data, setData] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("pokemon-user");
      setData(storedData);
    }
  }, []);

  if (!mounted) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return data ? (
    <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
      {JSON.stringify(JSON.parse(data), null, 2)}
    </pre>
  ) : (
    <p className="text-gray-500">No data found</p>
  );
}

// Client-side only component to avoid hydration issues
function CookiesDisplay() {
  const [cookies, setCookies] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const cookieList = document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(
          (cookie) => cookie.includes("supabase") || cookie.includes("sb-")
        );
      setCookies(cookieList);
    }
  }, []);

  if (!mounted) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-1">
      {cookies.length > 0 ? (
        cookies.map((cookie, index) => {
          const [name, value] = cookie.split("=");
          return (
            <div key={index} className="text-sm">
              <strong>{name}:</strong> {value ? "Present" : "Empty"}
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">No Supabase cookies found</p>
      )}
    </div>
  );
}

export default function SessionStatusPage() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    setLoading(true);
    console.log("🔄 Refreshing session...");

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("📋 Session data:", {
        hasSession: !!session,
        sessionId: session?.access_token
          ? session.access_token.substring(0, 20) + "..."
          : "No token",
        expiresAt: session?.expires_at,
        error: error,
      });

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("👤 User data:", {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userError: userError,
      });

      const sessionInfo = {
        session,
        user,
        error: error || userError,
        timestamp: new Date().toISOString(),
      };

      console.log("✅ Final session info:", {
        hasSession: !!sessionInfo.session,
        hasUser: !!sessionInfo.user,
        hasError: !!sessionInfo.error,
        timestamp: sessionInfo.timestamp,
      });

      setSessionInfo(sessionInfo);
    } catch (err) {
      console.error("❌ Session refresh error:", err);
      setSessionInfo({
        session: null,
        user: null,
        error: err,
        timestamp: new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      await refreshSession();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (hasSession: boolean, hasError: boolean) => {
    if (hasError) return <Badge variant="destructive">Error</Badge>;
    if (hasSession) return <Badge variant="default">Active</Badge>;
    return <Badge variant="secondary">No Session</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Session Status</h1>
          <div className="flex gap-2">
            <Button
              onClick={refreshSession}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button onClick={() => router.push("/")} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Auth Context Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Auth Context Status
                {getStatusBadge(!!authUser, false)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Loading:</strong> {authLoading ? "Yes" : "No"}
                </p>
                <p>
                  <strong>User:</strong> {authUser ? "Present" : "None"}
                </p>
                {authUser && (
                  <>
                    <p>
                      <strong>User ID:</strong> {authUser.id}
                    </p>
                    <p>
                      <strong>Username:</strong> {authUser.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {authUser.email}
                    </p>
                    <p>
                      <strong>Cards Count:</strong> {authUser.cardsCount}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Supabase Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Supabase Session Status
                {getStatusBadge(!!sessionInfo?.session, !!sessionInfo?.error)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {sessionInfo?.timestamp
                    ? formatDate(sessionInfo.timestamp)
                    : "Never"}
                </p>

                {sessionInfo?.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p>
                      <strong>Error:</strong>
                    </p>
                    <pre className="text-sm text-red-700 mt-1">
                      {JSON.stringify(sessionInfo.error, null, 2)}
                    </pre>
                  </div>
                )}

                {sessionInfo?.session ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p>
                        <strong>Session Active:</strong> Yes
                      </p>
                      <p>
                        <strong>Expires At:</strong>{" "}
                        {sessionInfo.session.expires_at
                          ? formatDate(sessionInfo.session.expires_at)
                          : "Unknown"}
                      </p>
                      <p>
                        <strong>Access Token:</strong>{" "}
                        {sessionInfo.session.access_token
                          ? "Present"
                          : "Missing"}
                      </p>
                      <p>
                        <strong>Refresh Token:</strong>{" "}
                        {sessionInfo.session.refresh_token
                          ? "Present"
                          : "Missing"}
                      </p>
                    </div>

                    {sessionInfo.user && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p>
                          <strong>User Details:</strong>
                        </p>
                        <p>
                          <strong>ID:</strong> {sessionInfo.user.id}
                        </p>
                        <p>
                          <strong>Email:</strong> {sessionInfo.user.email}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {sessionInfo.user.phone || "Not set"}
                        </p>
                        <p>
                          <strong>Email Confirmed:</strong>{" "}
                          {sessionInfo.user.email_confirmed_at ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Phone Confirmed:</strong>{" "}
                          {sessionInfo.user.phone_confirmed_at ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Created At:</strong>{" "}
                          {sessionInfo.user.created_at
                            ? formatDate(sessionInfo.user.created_at)
                            : "Unknown"}
                        </p>
                        <p>
                          <strong>Last Sign In:</strong>{" "}
                          {sessionInfo.user.last_sign_in_at
                            ? formatDate(sessionInfo.user.last_sign_in_at)
                            : "Unknown"}
                        </p>
                      </div>
                    )}

                    {sessionInfo.user?.user_metadata && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p>
                          <strong>User Metadata:</strong>
                        </p>
                        <pre className="text-sm text-gray-700 mt-1 overflow-auto">
                          {JSON.stringify(
                            sessionInfo.user.user_metadata,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}

                    {sessionInfo.user?.app_metadata && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <p>
                          <strong>App Metadata:</strong>
                        </p>
                        <pre className="text-sm text-gray-700 mt-1 overflow-auto">
                          {JSON.stringify(
                            sessionInfo.user.app_metadata,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <p>
                      <strong>No active session found</strong>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Local Storage Status */}
          <Card>
            <CardHeader>
              <CardTitle>Local Storage Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Pokemon User Data:</strong>
                </p>
                <LocalStorageDisplay />
              </div>
            </CardContent>
          </Card>

          {/* Cookies Status */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Supabase Cookies:</strong>
                </p>
                <CookiesDisplay />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
