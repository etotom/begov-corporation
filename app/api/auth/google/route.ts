import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { GOOGLE_STATE_COOKIE, googleAuthUrl } from "@/lib/google-auth";

export async function GET(request: Request) {
  const state = randomBytes(24).toString("hex");
  const redirectUri = `${new URL(request.url).origin}/api/auth/google/callback`;

  const res = NextResponse.redirect(googleAuthUrl(redirectUri, state));
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
