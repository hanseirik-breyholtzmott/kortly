"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cardsService } from "@/lib/supabase-cards";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { EnvCheck } from "./env-check";
import { AuthDebug } from "./auth-debug";
import { StorageTest } from "./storage-test";
import { StorageDebug } from "./storage-debug";

interface SupabaseTestProps {
  user?: any;
}

export function SupabaseTest({ user }: SupabaseTestProps) {
  const [testResults, setTestResults] = useState<{
    connection: boolean | null;
    storage: boolean | null;
    database: boolean | null;
  }>({
    connection: null,
    storage: null,
    database: null,
  });
  const [loading, setLoading] = useState(false);
  const [testCardName, setTestCardName] = useState("Test Card");

  const testConnection = async () => {
    setLoading(true);
    setTestResults({ connection: null, storage: null, database: null });

    try {
      // Test 1: Basic connection
      console.log("Testing Supabase connection...");
      const testFile = new File(["test"], "test.txt", { type: "text/plain" });
      const connectionTest = await cardsService.uploadImage(
        testFile,
        "test/connection-test.txt"
      );

      setTestResults((prev) => ({ ...prev, connection: true }));
      console.log("✅ Connection test passed");

      // Test 2: Database access
      console.log("Testing database access...");
      const cards = await cardsService.getUserCards(user?.id || "test");
      setTestResults((prev) => ({ ...prev, database: true }));
      console.log("✅ Database test passed");

      // Test 3: Storage access (with proper image)
      console.log("Testing storage access...");
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#4F46E5";
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("TEST", 25, 55);
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const testImage = new File([blob], "test-image.png", {
            type: "image/png",
          });
          const storageTest = await cardsService.uploadImage(
            testImage,
            `test/${Date.now()}-test-image.png`
          );

          if (storageTest) {
            setTestResults((prev) => ({ ...prev, storage: true }));
            console.log("✅ Storage test passed");
          } else {
            setTestResults((prev) => ({ ...prev, storage: false }));
            console.log("❌ Storage test failed");
          }
        }
      }, "image/png");
    } catch (error) {
      console.error("Test failed:", error);
      setTestResults((prev) => ({
        ...prev,
        connection: false,
        storage: false,
        database: false,
      }));
    } finally {
      setLoading(false);
    }
  };

  const testCardUpload = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    try {
      // Create a test image
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw a simple card
        ctx.fillStyle = "#1E40AF";
        ctx.fillRect(0, 0, 200, 300);
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText(testCardName, 20, 50);
        ctx.font = "16px Arial";
        ctx.fillText("Test Card", 20, 80);
        ctx.fillText("Type: Fire", 20, 110);
        ctx.fillText("Rarity: Common", 20, 140);
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const testImage = new File([blob], "test-card.png", {
            type: "image/png",
          });

          // Upload images
          const timestamp = Date.now();
          const frontImageUrl = await cardsService.uploadImage(
            testImage,
            `cards/${user.id}/${timestamp}-front-test.png`
          );
          const backImageUrl = await cardsService.uploadImage(
            testImage,
            `cards/${user.id}/${timestamp}-back-test.png`
          );

          if (frontImageUrl && backImageUrl) {
            // Create test card
            const testCard = await cardsService.createCard({
              user_id: user.id,
              name: testCardName,
              type: "Fire",
              rarity: "Common",
              set_name: "Test Set",
              card_number: "001/100",
              condition: "Near Mint",
              description:
                "This is a test card created to verify the upload functionality.",
              quantity: 1,
              is_graded: false,
              grade_company: "",
              grade_score: "",
              for_sale: false,
              front_image_url: frontImageUrl,
              back_image_url: backImageUrl,
              damage_images: [],
            });

            if (testCard) {
              alert("✅ Test card uploaded successfully!");
              console.log("Test card created:", testCard);
            } else {
              alert("❌ Failed to create test card");
            }
          } else {
            alert("❌ Failed to upload test images");
          }
        }
      }, "image/png");
    } catch (error) {
      console.error("Card upload test failed:", error);
      alert("❌ Card upload test failed: " + error);
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
    <div className="space-y-6">
      <EnvCheck />
      <AuthDebug user={user} />
      <StorageTest user={user} />
      <StorageDebug user={user} />

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Supabase Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.connection)}
                <span className="font-medium">Connection Test</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.connection)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.database)}
                <span className="font-medium">Database Access</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.database)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.storage)}
                <span className="font-medium">Storage Access</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.storage)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={testConnection}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Test Supabase Connection"
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="test-card-name">Test Card Name</Label>
              <Input
                id="test-card-name"
                value={testCardName}
                onChange={(e) => setTestCardName(e.target.value)}
                placeholder="Enter test card name"
              />
            </div>

            <Button
              onClick={testCardUpload}
              disabled={loading || !user}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading Test Card...
                </>
              ) : (
                "Upload Test Card to Database"
              )}
            </Button>
          </div>

          {!user && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Please log in to test card upload functionality
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Connection Test:</strong> Verifies Supabase client can
              connect
            </p>
            <p>
              <strong>Database Test:</strong> Tests reading from the cards table
            </p>
            <p>
              <strong>Storage Test:</strong> Tests uploading images to storage
              bucket
            </p>
            <p>
              <strong>Card Upload:</strong> Creates a complete test card with
              images
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
