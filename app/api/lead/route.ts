import { NextResponse } from "next/server";
import { createLead } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/server-auth";
import { notifyNewLead } from "@/lib/telegram";

const MAX = 2000;
const clip = (v: unknown) => String(v ?? "").slice(0, MAX);

export async function POST(request: Request) {
  // 20 заявок в час с одного IP — защита от спама в таблицу лидов
  if (!rateLimit(`lead:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Слишком много заявок, попробуйте позже" }, { status: 429 });
  }
  try {
    const b = await request.json();
    const type = clip(b.type) || "Вопрос";
    const summary = clip(b.summary);
    if (!summary) return NextResponse.json({ ok: false, error: "Пустая заявка" }, { status: 400 });
    const user = await getSessionUser();
    const lead = await createLead({
      type,
      summary,
      details: clip(b.details),
      name: clip(b.name) || user?.name || "",
      phone: clip(b.phone) || user?.phone || "",
      country: clip(b.country) || user?.country || "",
      userId: user?.id ?? null,
    });
    // Мгновенное уведомление админам в Telegram (не ломает ответ, если бот не настроен)
    await notifyNewLead(lead);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
