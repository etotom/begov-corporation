import "server-only";
import { getTelegramAdmins, type DbLead } from "@/lib/db";

const API = "https://api.telegram.org/bot";

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return t;
}

// Экранирование для parse_mode: HTML
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type Json = Record<string, unknown>;

export async function tg(method: string, params: Json): Promise<Json> {
  try {
    const res = await fetch(`${API}${token()}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10000),
    });
    return (await res.json()) as Json;
  } catch (e) {
    console.error(`telegram ${method} failed`, e);
    return { ok: false };
  }
}

export function sendMessage(chatId: number, text: string, extra: Json = {}) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

export function editText(chatId: number, messageId: number, text: string, extra: Json = {}) {
  return tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

export function sendPhoto(chatId: number, photo: string, caption: string, extra: Json = {}) {
  return tg("sendPhoto", { chat_id: chatId, photo, caption, parse_mode: "HTML", ...extra });
}

export function answerCallback(id: string, text?: string, showAlert = false) {
  return tg("answerCallbackQuery", { callback_query_id: id, text, show_alert: showAlert });
}

export function sendChatAction(chatId: number, action = "typing") {
  return tg("sendChatAction", { chat_id: chatId, action });
}

const STATUS_ICON: Record<string, string> = { new: "🟡", done: "✅" };

// Уведомление всех админов о новой заявке (с сайта или из бота).
// Никогда не бросает исключение — не должно ломать создание заявки.
export async function notifyNewLead(lead: DbLead): Promise<void> {
  try {
    const admins = await getTelegramAdmins();
    if (admins.length === 0) return;

    const lines = [
      `🔔 <b>Новая заявка #${lead.id}</b>`,
      `📌 ${esc(lead.type)}`,
      "",
      `<b>${esc(lead.summary)}</b>`,
    ];
    if (lead.details) lines.push(esc(lead.details));
    lines.push("");
    if (lead.name) lines.push(`👤 ${esc(lead.name)}`);
    if (lead.phone) lines.push(`📞 <code>${esc(lead.phone)}</code>`);
    if (lead.country) lines.push(`🌍 ${esc(lead.country)}`);
    lines.push(`🕒 ${new Date(lead.createdAt).toLocaleString("ru-RU")}`);
    lines.push(lead.telegramChatId ? "💬 Источник: Telegram-бот" : "🌐 Источник: сайт");

    const buttons: { text: string; callback_data: string }[][] = [
      [{ text: "✅ Отметить обработанной", callback_data: `lead:done:${lead.id}` }],
    ];
    if (lead.telegramChatId) {
      buttons.push([{ text: "💬 Ответить клиенту", callback_data: `lead:reply:${lead.id}` }]);
    }
    buttons.push([{ text: "📋 Открыть заявку", callback_data: `lead:view:${lead.id}` }]);

    const text = lines.join("\n");
    for (const a of admins) {
      await sendMessage(a.chatId, text, { reply_markup: { inline_keyboard: buttons } });
    }
  } catch (e) {
    console.error("notifyNewLead failed", e);
  }
}

export { STATUS_ICON };
