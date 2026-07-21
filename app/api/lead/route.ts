import { NextResponse } from "next/server";

// Точка приема заявок. Сейчас пишет в логи Vercel; сюда подключается
// Telegram-бот, почта или CRM — см. README.
export async function POST(request: Request) {
  try {
    const lead = await request.json();
    console.log("[lead]", JSON.stringify(lead));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
