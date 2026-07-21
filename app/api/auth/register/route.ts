import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { hashPassword, makeSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/server-auth";

export async function POST(request: Request) {
  // 5 регистраций в час с одного IP — защита от массового создания аккаунтов
  if (!rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много попыток регистрации. Попробуйте позже." },
      { status: 429 },
    );
  }

  const b = await request.json().catch(() => null);
  const name = String(b?.name ?? "").trim().slice(0, 200);
  const email = String(b?.email ?? "").trim().toLowerCase().slice(0, 200);
  const phone = String(b?.phone ?? "").trim().slice(0, 50);
  const country = String(b?.country ?? "").trim().slice(0, 100);
  const password = String(b?.password ?? "");

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: "Заполните имя и телефон" }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Проверьте формат email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Пароль должен быть не короче 8 символов" },
      { status: 400 },
    );
  }

  const user = await createUser({ name, email, phone, country, passHash: hashPassword(password) });
  if (user === "exists") {
    return NextResponse.json(
      { ok: false, error: "Пользователь с таким email уже зарегистрирован" },
      { status: 409 },
    );
  }

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), sessionCookieOptions());
  return res;
}
