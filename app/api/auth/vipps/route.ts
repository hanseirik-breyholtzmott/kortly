import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUri =
    searchParams.get("redirect_uri") ||
    `${request.nextUrl.origin}/auth/callback`;

  // Vipps OAuth configuration
  const vippsClientId = process.env.VIPPS_CLIENT_ID;
  const vippsClientSecret = process.env.VIPPS_CLIENT_SECRET;
  const vippsRedirectUri = process.env.VIPPS_REDIRECT_URI || redirectUri;

  console.log("Vipps OAuth config:", {
    hasClientId: !!vippsClientId,
    hasClientSecret: !!vippsClientSecret,
    redirectUri: vippsRedirectUri,
  });

  if (!vippsClientId) {
    return NextResponse.json(
      { error: "Vipps client ID not configured" },
      { status: 500 }
    );
  }

  if (!vippsClientSecret) {
    return NextResponse.json(
      { error: "Vipps client secret not configured" },
      { status: 500 }
    );
  }

  // Generate state parameter for security
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Store state in a cookie for verification
  const response = NextResponse.redirect(
    `https://api.vipps.no/access-management-1.0/access/oauth2/auth?` +
      `response_type=code&` +
      `client_id=${vippsClientId}&` +
      `redirect_uri=${encodeURIComponent(vippsRedirectUri)}&` +
      `state=${state}&` +
      `scope=openid+name+email+phoneNumber+address+birthDate+nin`
  );

  // Set state cookie
  response.cookies.set("vipps_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
