"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Home page auth state:", {
      user: !!user,
      loading,
      userId: user?.id,
    });

    if (!loading && !user) {
      console.log("No user found, redirecting to login");
      router.push("/login");
    } else if (!loading && user) {
      console.log(
        "User found, redirecting to dashboard:",
        user.user_metadata?.username
      );
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null; // Will redirect via useEffect
}
