import { NextResponse } from "next/server";
import { tg } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Одноразовая (повторяемая) регистрация вебхука и команд бота.
// Защищено тем же секретом, что и вебхук: /api/telegram/setup?key=<SECRET>
export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || key !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const webhookUrl = `${url.origin}/api/telegram/webhook`;
  const setWebhook = await tg("setWebhook", {
    url: webhookUrl,
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  const setCommands = await tg("setMyCommands", {
    commands: [
      { command: "start", description: "Главное меню" },
      { command: "catalog", description: "Каталог авто" },
      { command: "vin", description: "Проверка по VIN" },
      { command: "faq", description: "Частые вопросы" },
      { command: "contacts", description: "Контакты" },
      { command: "myid", description: "Мой Telegram ID" },
      { command: "admin", description: "Панель администратора" },
    ],
  });
  const me = await tg("getMe", {});

  return NextResponse.json({ ok: true, webhookUrl, setWebhook, setCommands, me });
}
