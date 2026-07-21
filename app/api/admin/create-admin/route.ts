import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createUser } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/server-auth";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  // 10 в час с IP — создание админ-аккаунтов не должно молотиться скриптом
  // даже с валидной админской сессией.
  if (!rateLimit(`create-admin:${clientIp(request)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Слишком много попыток, попробуйте позже" }, { status: 429 });
  }

  const b = await request.json().catch(() => null);
  const email = String(b?.email ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(b?.password ?? "");
  const name = String(b?.name ?? "").trim().slice(0, 200) || email.split("@")[0];

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Проверьте формат email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Пароль должен быть не короче 8 символов" }, { status: 400 });
  }

  const user = await createUser({
    name,
    email,
    phone: "",
    country: "",
    passHash: hashPassword(password),
    role: "admin",
  });
  if (user === "exists") {
    return NextResponse.json(
      { ok: false, error: "Пользователь с таким email уже зарегистрирован" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, user });
}
