"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface StorageDebugProps {
  user?: any;
}

export function StorageDebug({ user }: StorageDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugStorage = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    setDebugInfo(null);

    try {
      const supabase = createClient();
      const results: any = {};

      // Test 1: Check authentication
      console.log("1. Testing authentication...");
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      results.auth = {
        success: !authError && !!authUser,
        error: authError?.message,
        userId: authUser?.id,
      };

      // Test 2: Check bucket existence
      console.log("2. Testing bucket existence...");
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();
      const cardImagesBucket = buckets?.find(
        (bucket) => bucket.id === "card-images"
      );
      results.bucket = {
        success: !!cardImagesBucket,
        error: bucketsError?.message,
        bucket: cardImagesBucket,
      };

      // Test 3: Check bucket policies
      console.log("3. Testing bucket policies...");
      const { data: policies, error: policiesError } = await supabase
        .from("pg_policies")
        .select("*")
        .eq("tablename", "objects")
        .eq("schemaname", "storage");

      results.policies = {
        success: !policiesError,
        error: policiesError?.message,
        count: policies?.length || 0,
        policies: policies,
      };

      // Test 4: Try to upload a test file
      console.log("4. Testing upload...");
      const testFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const testPath = `debug/${user.id}/${Date.now()}-test.txt`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("card-images")
        .upload(testPath, testFile);

      results.upload = {
        success: !uploadError,
        error: uploadError?.message,
        data: uploadData,
      };

      // Test 5: Try to read the uploaded file
      if (results.upload.success) {
        console.log("5. Testing read...");
        const { data: readData, error: readError } = await supabase.storage
          .from("card-images")
          .download(testPath);

        results.read = {
          success: !readError,
          error: readError?.message,
        };

        // Clean up test file
        await supabase.storage.from("card-images").remove([testPath]);
      }

      setDebugInfo(results);
    } catch (error) {
      console.error("Storage debug error:", error);
      setDebugInfo({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === undefined)
      return <Loader2 className="h-4 w-4 animate-spin" />;
    if (success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (success: boolean | undefined) => {
    if (success === undefined) return "Testing...";
    if (success) return "Passed";
    return "Failed";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Storage Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={debugStorage}
          disabled={loading || !user}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Debugging Storage...
            </>
          ) : (
            "Debug Storage Setup"
          )}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(debugInfo.auth?.success)}
                  <span className="font-medium">Authentication</span>
                </div>
                <div className="text-sm text-gray-600">
                  {getStatusText(debugInfo.auth?.success)}
                </div>
                {debugInfo.auth?.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {debugInfo.auth.error}
                  </div>
                )}
                {debugInfo.auth?.userId && (
                  <div className="text-xs text-gray-500 mt-1">
                    User ID: {debugInfo.auth.userId}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(debugInfo.bucket?.success)}
                  <span className="font-medium">Bucket Exists</span>
                </div>
                <div className="text-sm text-gray-600">
                  {getStatusText(debugInfo.bucket?.success)}
                </div>
                {debugInfo.bucket?.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {debugInfo.bucket.error}
                  </div>
                )}
                {debugInfo.bucket?.bucket && (
                  <div className="text-xs text-gray-500 mt-1">
                    Public: {debugInfo.bucket.bucket.public ? "Yes" : "No"}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(debugInfo.policies?.success)}
                  <span className="font-medium">Policies</span>
                </div>
                <div className="text-sm text-gray-600">
                  {debugInfo.policies?.count || 0} policies found
                </div>
                {debugInfo.policies?.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {debugInfo.policies.error}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(debugInfo.upload?.success)}
                  <span className="font-medium">Upload Test</span>
                </div>
                <div className="text-sm text-gray-600">
                  {getStatusText(debugInfo.upload?.success)}
                </div>
                {debugInfo.upload?.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {debugInfo.upload.error}
                  </div>
                )}
              </div>
            </div>

            {debugInfo.upload?.success && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(debugInfo.read?.success)}
                  <span className="font-medium">Read Test</span>
                </div>
                <div className="text-sm text-gray-600">
                  {getStatusText(debugInfo.read?.success)}
                </div>
                {debugInfo.read?.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {debugInfo.read.error}
                  </div>
                )}
              </div>
            )}

            {debugInfo.policies?.policies &&
              debugInfo.policies.policies.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Current Storage Policies:
                  </h4>
                  <div className="space-y-1">
                    {debugInfo.policies.policies.map(
                      (policy: any, index: number) => (
                        <div key={index} className="text-xs text-blue-800">
                          • {policy.policyname} ({policy.cmd})
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {debugInfo.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Debug Error</span>
                </div>
                <div className="text-sm text-red-700 mt-1">
                  {debugInfo.error}
                </div>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Please log in to debug storage
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
