import { NextResponse } from "next/server";
import { createLead } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

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
    await createLead({
      type,
      summary,
      details: clip(b.details),
      name: clip(b.name),
      phone: clip(b.phone),
      country: clip(b.country),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
