"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Phone, Mail, User, Shield } from "lucide-react";

export default function VippsCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const processVippsUser = async () => {
      try {
        // Get user data from cookie
        const response = await fetch("/api/auth/vipps/user-data");

        if (!response.ok) {
          throw new Error("Failed to get user data");
        }

        const data = await response.json();
        setUserData(data);

        // Process user data through API route (handles Supabase admin operations)
        const processResponse = await fetch("/api/auth/vipps/process-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!processResponse.ok) {
          const errorData = await processResponse.json();
          throw new Error(errorData.error || "Failed to process user data");
        }

        const { profile } = await processResponse.json();

        // Store the user data in localStorage for the auth system
        localStorage.setItem(
          "pokemon-user",
          JSON.stringify({
            id: profile.id,
            username: profile.username,
            email: profile.email,
            cardsCount: profile.cards_count,
            joinedAt: profile.joined_at,
            // Additional data
            birthDate: profile.birth_date,
            address: profile.address,
            phoneNumber: profile.phone_number,
            givenName: profile.given_name,
            familyName: profile.family_name,
          })
        );

        setStatus("success");

        // Redirect to the main app after a short delay
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (error) {
        console.error("Error processing Vipps user:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setStatus("error");
      }
    };

    processVippsUser();
  }, [router]);

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Processing Vipps Login
            </h2>
            <p className="text-gray-600">Setting up your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Login Failed
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600 mb-2">
              Welcome to PokéCard Collector!
            </CardTitle>
            <p className="text-gray-600">
              Your Vipps profile has been successfully linked
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Information Display */}
            {userData && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Your Profile Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {userData.name || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">
                        {userData.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">
                        {userData.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Birth Date</p>
                      <p className="font-medium">
                        {userData.birth_date || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {userData.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">
                          {typeof userData.address === "string"
                            ? userData.address
                            : `${userData.address.street_address || ""}, ${
                                userData.address.postal_code || ""
                              } ${userData.address.city || ""}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.nin && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">National ID</p>
                        <p className="font-medium text-xs">
                          {process.env.NODE_ENV === "development"
                            ? userData.nin
                            : "***" + userData.nin.slice(-4)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Redirecting to your dashboard...
                </span>
              </div>

              <Button
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
