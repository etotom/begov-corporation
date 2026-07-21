import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { makeSession, sessionCookieOptions, SESSION_COOKIE, verifyPassword } from "@/lib/server-auth";

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  const email = String(b?.email ?? "").trim().toLowerCase();
  const password = String(b?.password ?? "");

  const stored = email && password ? await getUserByEmail(email) : null;
  if (!stored || !verifyPassword(password, stored.passHash)) {
    return NextResponse.json({ ok: false, error: "Неверный email или пароль" }, { status: 401 });
  }

  const { passHash: _passHash, ...user } = stored;
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), sessionCookieOptions());
  return res;
}
