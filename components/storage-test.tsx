"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface StorageTestProps {
  user?: any;
}

export function StorageTest({ user }: StorageTestProps) {
  const [testResults, setTestResults] = useState<{
    bucketExists: boolean | null;
    canUpload: boolean | null;
    canRead: boolean | null;
  }>({
    bucketExists: null,
    canUpload: null,
    canRead: null,
  });
  const [loading, setLoading] = useState(false);

  const testStorage = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    setTestResults({ bucketExists: null, canUpload: null, canRead: null });

    try {
      const supabase = createClient();

      // Test 1: Check if bucket exists
      console.log("Testing bucket existence...");
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();

      const cardImagesBucket = buckets?.find(
        (bucket) => bucket.id === "card-images"
      );
      setTestResults((prev) => ({ ...prev, bucketExists: !!cardImagesBucket }));

      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        setTestResults((prev) => ({ ...prev, bucketExists: false }));
      }

      // Test 2: Try to upload a test file
      console.log("Testing upload permissions...");
      const testFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const testPath = `test/${user.id}/${Date.now()}-test.txt`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("card-images")
        .upload(testPath, testFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setTestResults((prev) => ({ ...prev, canUpload: false }));
      } else {
        console.log("Upload successful:", uploadData);
        setTestResults((prev) => ({ ...prev, canUpload: true }));

        // Test 3: Try to read the uploaded file
        console.log("Testing read permissions...");
        const { data: readData, error: readError } = await supabase.storage
          .from("card-images")
          .download(testPath);

        if (readError) {
          console.error("Read error:", readError);
          setTestResults((prev) => ({ ...prev, canRead: false }));
        } else {
          console.log("Read successful");
          setTestResults((prev) => ({ ...prev, canRead: true }));
        }

        // Clean up test file
        await supabase.storage.from("card-images").remove([testPath]);
      }
    } catch (error) {
      console.error("Storage test error:", error);
      setTestResults({ bucketExists: false, canUpload: false, canRead: false });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (status) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return "Testing...";
    if (status) return "Passed";
    return "Failed";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗄️ Storage Permissions Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.bucketExists)}
              <span className="font-medium">Bucket Exists</span>
            </div>
            <span className="text-sm text-gray-600">
              {getStatusText(testResults.bucketExists)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.canUpload)}
              <span className="font-medium">Can Upload</span>
            </div>
            <span className="text-sm text-gray-600">
              {getStatusText(testResults.canUpload)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.canRead)}
              <span className="font-medium">Can Read</span>
            </div>
            <span className="text-sm text-gray-600">
              {getStatusText(testResults.canRead)}
            </span>
          </div>
        </div>

        <Button
          onClick={testStorage}
          disabled={loading || !user}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Storage...
            </>
          ) : (
            "Test Storage Permissions"
          )}
        </Button>

        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Please log in to test storage permissions
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Bucket Exists:</strong> Checks if card-images bucket is
            created
          </p>
          <p>
            <strong>Can Upload:</strong> Tests if you can upload files to
            storage
          </p>
          <p>
            <strong>Can Read:</strong> Tests if you can download files from
            storage
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
