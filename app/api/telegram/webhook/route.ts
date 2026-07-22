import { NextResponse } from "next/server";
import { handleUpdate } from "@/lib/telegram-bot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  // Telegram отправляет секрет в заголовке (задаётся при setWebhook) — проверяем.
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await request.json().catch(() => null);
  if (update) {
    try {
      await handleUpdate(update);
    } catch (e) {
      console.error("telegram update failed", e);
    }
  }
  // Всегда 200 — иначе Telegram будет ретраить один и тот же апдейт.
  return NextResponse.json({ ok: true });
}
