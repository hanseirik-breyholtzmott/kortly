"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Grid3X3, Target, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { ProfileTab } from "@/components/profile-tab";
import { CardUploadsTab } from "@/components/card-uploads-tab";
import { CardCollectionTab } from "@/components/card-collection-tab";
import { SupabaseTest } from "@/components/supabase-test";

interface DashboardClientProps {
  user: any;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [copied, setCopied] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">
                  {user.user_metadata?.username || user.email}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
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
            <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Welcome back!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    User Details
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p>
                      <span className="font-medium">User ID:</span> {user.id}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(user.created_at).toISOString().split("T")[0]}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Session Info
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span className="text-green-600">Active</span>
                    </p>
                    <p>
                      <span className="font-medium">Provider:</span>{" "}
                      {user.app_metadata?.provider || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {/* User JSON Data */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Raw User Data</h3>
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
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
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
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50">
            <TabsTrigger value="profile" className="gap-2">
              <Target className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="uploads" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Card Uploads
            </TabsTrigger>
            <TabsTrigger value="collection" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Collection
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
