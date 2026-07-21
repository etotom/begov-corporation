import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { makeSession, sessionCookieOptions, SESSION_COOKIE, verifyPassword } from "@/lib/server-auth";

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  const email = String(b?.email ?? "").trim().toLowerCase();
  const password = String(b?.password ?? "");

  // 5 попыток входа за 15 минут на связку IP+email — защита от подбора пароля
  if (!rateLimit(`login:${clientIp(request)}:${email}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много попыток входа. Попробуйте через 15 минут." },
      { status: 429 },
    );
  }

  const stored = email && password ? await getUserByEmail(email) : null;
  if (!stored || !verifyPassword(password, stored.passHash)) {
    return NextResponse.json({ ok: false, error: "Неверный email или пароль" }, { status: 401 });
  }

  const { passHash: _passHash, ...user } = stored;
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), sessionCookieOptions());
  return res;
}
