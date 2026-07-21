import { NextResponse } from "next/server";
import { createLead } from "@/lib/db";

const MAX = 2000;
const clip = (v: unknown) => String(v ?? "").slice(0, MAX);

export async function POST(request: Request) {
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
