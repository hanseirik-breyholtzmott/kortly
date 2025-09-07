import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Calendar, Shield } from "lucide-react";

export default async function SessionPage() {
  const supabase = await createClient();

  // Get the current user from server-side
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-900">Session Info</h1>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Server-Side Auth
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-700 font-medium">
                Welcome, {user.email}!
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supabase User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Supabase User Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User ID
                </label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                  {user.id}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-sm">{user.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Email Verified
                </label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      user.email_confirmed_at ? "default" : "destructive"
                    }
                  >
                    {user.email_confirmed_at ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm">
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Last Sign In
                </label>
                <p className="text-sm">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Profile Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Username
                    </label>
                    <p className="text-sm font-medium">
                      {user.user_metadata?.username}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-sm">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Joined At
                    </label>
                    <p className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Profile ID
                    </label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {user.id}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No profile data found</p>
                  <Badge variant="outline">Profile Not Created</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session Metadata */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Session Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  User Metadata
                </label>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  App Metadata
                </label>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(user.app_metadata, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
