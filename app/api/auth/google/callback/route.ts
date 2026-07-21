import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";
import { exchangeGoogleCode, GOOGLE_STATE_COOKIE } from "@/lib/google-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { hashPassword, makeSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/server-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const failUrl = (msg: string) => `${origin}/auth/login?error=${encodeURIComponent(msg)}`;

  if (!rateLimit(`google-callback:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.redirect(failUrl("Слишком много попыток, попробуйте позже"));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${GOOGLE_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(failUrl("Сессия входа истекла, попробуйте ещё раз"));
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const profile = await exchangeGoogleCode(code, redirectUri);

    if (!profile.email || !profile.email_verified) {
      return NextResponse.redirect(failUrl("Email в Google-аккаунте не подтвержден"));
    }

    const existingUser = await getUserByEmail(profile.email);
    let userId: number;
    let role: "user" | "admin";

    if (existingUser) {
      userId = existingUser.id;
      role = existingUser.role;
    } else {
      const name = profile.name || profile.given_name || profile.email.split("@")[0];
      const created = await createUser({
        name,
        email: profile.email,
        phone: "",
        country: "",
        passHash: hashPassword(randomBytes(32).toString("hex")),
        authProvider: "google",
      });
      if (created === "exists") {
        // гонка: аккаунт создался между проверкой и вставкой — просто перечитываем
        const raced = await getUserByEmail(profile.email);
        if (!raced) return NextResponse.redirect(failUrl("Не удалось войти, попробуйте позже"));
        userId = raced.id;
        role = raced.role;
      } else {
        userId = created.id;
        role = created.role;
      }
    }

    const res = NextResponse.redirect(`${origin}${role === "admin" ? "/admin" : "/account"}`);
    res.cookies.set(SESSION_COOKIE, makeSession(userId), sessionCookieOptions());
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  } catch {
    return NextResponse.redirect(failUrl("Не удалось войти через Google, попробуйте позже"));
  }
}
