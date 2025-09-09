import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Use getUser() for secure authentication (as recommended by Supabase)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log("No user found, redirecting to login");
    redirect("/login");
  }

  console.log("Dashboard server-side user:", {
    user: !!user,
    userId: user?.id,
  });

  return <DashboardClient user={user} />;
}
