"use client";

import CardUpload from "@/components/card-upload";

interface CardUploadsTabProps {
  user?: any;
}

export function CardUploadsTab({ user }: CardUploadsTabProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <CardUpload user={user} />
    </div>
  );
}
