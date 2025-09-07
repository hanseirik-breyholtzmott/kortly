"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AuthDebugProps {
  user?: any;
}

export function AuthDebug({ user }: AuthDebugProps) {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAuth = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      setDebugInfo({
        session: {
          exists: !!session,
          user: session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                created_at: session.user.created_at,
              }
            : null,
          error: sessionError?.message,
        },
        user: {
          exists: !!currentUser,
          user: currentUser
            ? {
                id: currentUser.id,
                email: currentUser.email,
                created_at: currentUser.created_at,
              }
            : null,
          error: userError?.message,
        },
        context: {
          user: user
            ? {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
              }
            : null,
          loading,
        },
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? "Set"
            : "Missing",
        },
      });
    } catch (error) {
      console.error("Debug refresh error:", error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    if (condition) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Authentication Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button onClick={refreshAuth} disabled={isRefreshing} size="sm">
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Auth
              </>
            )}
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4">
            {/* Environment Check */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Environment</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!debugInfo.environment?.supabaseUrl)}
                  <span>
                    Supabase URL:{" "}
                    {debugInfo.environment?.supabaseUrl ? "Set" : "Missing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!debugInfo.environment?.supabaseKey)}
                  <span>
                    Supabase Key:{" "}
                    {debugInfo.environment?.supabaseKey || "Missing"}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Check */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Supabase Session</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.session?.exists)}
                  <span>
                    Session exists: {debugInfo.session?.exists ? "Yes" : "No"}
                  </span>
                </div>
                {debugInfo.session?.user && (
                  <div className="ml-6 text-sm text-gray-600">
                    <p>User ID: {debugInfo.session.user.id}</p>
                    <p>Email: {debugInfo.session.user.email}</p>
                  </div>
                )}
                {debugInfo.session?.error && (
                  <div className="ml-6 text-sm text-red-600">
                    Error: {debugInfo.session.error}
                  </div>
                )}
              </div>
            </div>

            {/* User Check */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">Supabase User</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.user?.exists)}
                  <span>
                    User exists: {debugInfo.user?.exists ? "Yes" : "No"}
                  </span>
                </div>
                {debugInfo.user?.user && (
                  <div className="ml-6 text-sm text-gray-600">
                    <p>User ID: {debugInfo.user.user.id}</p>
                    <p>Email: {debugInfo.user.user.email}</p>
                  </div>
                )}
                {debugInfo.user?.error && (
                  <div className="ml-6 text-sm text-red-600">
                    Error: {debugInfo.user.error}
                  </div>
                )}
              </div>
            </div>

            {/* Context Check */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">React Context</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!debugInfo.context?.user)}
                  <span>
                    Context user: {debugInfo.context?.user ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    Loading: {debugInfo.context?.loading ? "Yes" : "No"}
                  </span>
                </div>
                {debugInfo.context?.user && (
                  <div className="ml-6 text-sm text-gray-600">
                    <p>User ID: {debugInfo.context.user.id}</p>
                    <p>Email: {debugInfo.context.user.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Raw Debug Data */}
            <details className="p-4 bg-gray-100 rounded-lg">
              <summary className="font-semibold cursor-pointer">
                Raw Debug Data
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
