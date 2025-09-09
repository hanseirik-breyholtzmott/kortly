"use client";

import CardUpload from "@/components/card-upload";
import type { User } from "@supabase/supabase-js";

interface CardUploadsTabProps {
  user?: User;
}

export function CardUploadsTab({ user }: CardUploadsTabProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <CardUpload user={user} />
    </div>
  );
}
