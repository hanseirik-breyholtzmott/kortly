import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("vipps_user_data");

  if (!userDataCookie) {
    return NextResponse.json({ error: "No user data found" }, { status: 404 });
  }

  try {
    const userData = JSON.parse(userDataCookie.value);

    // Clear the cookie after reading
    const response = NextResponse.json(userData);
    response.cookies.delete("vipps_user_data");

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
  }
}
