import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

// Честный, представившийся бот (как у Slack/Telegram при разворачивании ссылок) —
// вытягиваем только то, что сайт сам публикует в open graph / meta для превью.
// Если сайт блокирует ботов (как myauto.ge), просто возвращаем ok:false —
// админ заполняет карточку авто вручную, ссылка на объявление сохраняется отдельно.
const BOT_UA = "BegovCorporationLinkPreview/1.0 (+https://begov-corporation.vercel.app)";

function metaContent(html: string, key: string): string | null {
  const attrs = ["property", "name"];
  for (const attr of attrs) {
    const re1 = new RegExp(`<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
    const m1 = html.match(re1);
    if (m1) return m1[1];
    const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i");
    const m2 = html.match(re2);
    if (m2) return m2[1];
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  let url: URL;
  try {
    url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ ok: false, reason: "Некорректная ссылка" }, { status: 400 });
  }
  const host = url.hostname.toLowerCase();
  const isPrivate =
    host === "localhost" ||
    /^127\./.test(host) ||
    /^0\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "::1";
  if (isPrivate) {
    return NextResponse.json({ ok: false, reason: "Недопустимый адрес" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BOT_UA, Accept: "text/html" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        reason: `Сайт ответил ${res.status} — заполните карточку вручную`,
      });
    }
    const html = (await res.text()).slice(0, 300_000);

    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null;
    const title = metaContent(html, "og:title") ?? titleTag;
    const description = metaContent(html, "og:description") ?? metaContent(html, "description");
    const image = metaContent(html, "og:image") ?? metaContent(html, "twitter:image");
    const priceRaw =
      metaContent(html, "product:price:amount") ?? metaContent(html, "og:price:amount");

    return NextResponse.json({
      ok: true,
      data: {
        title: title ? decodeEntities(title).trim() : null,
        description: description ? decodeEntities(description).trim() : null,
        image: image ? decodeEntities(image).trim() : null,
        price: priceRaw ? Number(priceRaw.replace(/[^\d.]/g, "")) || null : null,
      },
    });
  } catch {
    return NextResponse.json({
      ok: false,
      reason: "Сайт не ответил или заблокировал запрос — заполните карточку вручную",
    });
  }
}
