"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function VippsLoginButton() {
  const { loginWithVipps } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleVippsLogin = async () => {
    try {
      setLoading(true);
      await loginWithVipps();
    } catch (error) {
      console.error("Vipps login error:", error);
      alert("Failed to login with Vipps. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleVippsLogin}
      disabled={loading}
      className="w-full bg-[#FF5B24] hover:bg-[#E04A1B] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Connecting to Vipps...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {/* Vipps Logo SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
              fill="currentColor"
            />
          </svg>
          <span className="font-semibold">Log in with Vipps</span>
        </div>
      )}
    </Button>
  );
}
