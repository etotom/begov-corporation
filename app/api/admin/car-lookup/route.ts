import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Инструмент только для админа: по ссылке на объявление вытаскиваем то, что
// страница отдаёт в открытом HTML — заголовок, описание, цену и ВСЕ фото
// галереи. Заявки-товары с площадок объявлений это публикуют сами (og-теги,
// JSON-LD, галерея с itemprop="image"). Никакого обхода бот-защиты: если сайт
// не отдаёт HTML — админ заполняет карточку вручную.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MAX_IMAGES = 20;

// Марки — многословные первыми, чтобы «Land Rover», «Mercedes-Benz» и т.п.
// матчились целиком, а не по первому слову.
const MAKES = [
  "Land Rover", "Range Rover", "Mercedes-Benz", "Mercedes", "Alfa Romeo", "Aston Martin",
  "Rolls-Royce", "Great Wall", "Iran Khodro", "Ssang Yong", "SsangYong",
  "BMW", "Toyota", "Lexus", "Honda", "Acura", "Hyundai", "Genesis", "Kia", "Nissan", "Infiniti",
  "Mitsubishi", "Mazda", "Subaru", "Suzuki", "Daihatsu", "Isuzu", "Datsun",
  "Chevrolet", "Ford", "Dodge", "Chrysler", "Jeep", "Ram", "GMC", "Cadillac", "Buick", "Lincoln",
  "Tesla", "Rivian",
  "Audi", "Volkswagen", "Porsche", "Opel", "Skoda", "Seat", "Volvo", "Saab",
  "Renault", "Peugeot", "Citroen", "Citroën", "DS", "Fiat", "Lancia", "Mini", "Jaguar",
  "Bentley", "Maserati", "Ferrari", "Lamborghini", "Bugatti", "McLaren",
  "Chery", "Haval", "Geely", "BYD", "Changan", "Exeed", "Omoda", "Jetour", "Jac", "JAC",
  "Zeekr", "Lixiang", "Li Auto", "Nio", "Xpeng", "Hongqi",
  "Lada", "VAZ", "GAZ", "UAZ", "ZAZ", "Moskvich", "Ravon", "Daewoo", "Ravon",
  "Volkswagen", "VW",
];

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function metaContent(html: string, key: string): string | null {
  for (const attr of ["property", "name"]) {
    const re1 = new RegExp(`<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
    const m1 = html.match(re1);
    if (m1) return m1[1];
    const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i");
    const m2 = html.match(re2);
    if (m2) return m2[1];
  }
  return null;
}

function metaAll(html: string, key: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<meta[^>]*(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

const JUNK = /(logo|sprite|placeholder|avatar|icon|blank|no[-_]?image|no[-_]?photo|default|watermark|1x1|pixel|spacer)/i;

function isGoodImage(u: string): boolean {
  if (!/^https?:\/\//i.test(u)) return false;
  if (u.startsWith("data:")) return false;
  if (/\.svg(\?|$)/i.test(u)) return false;
  if (JUNK.test(u)) return false;
  return true;
}

function collectImages(html: string, ogImages: string[]): string[] {
  const seen = new Set<string>();
  const push = (raw?: string | null) => {
    if (!raw) return;
    const u = decodeEntities(raw.trim());
    if (isGoodImage(u) && !seen.has(u)) seen.add(u);
  };

  // 1. og:image / twitter:image (главное фото — первым)
  ogImages.forEach(push);
  metaAll(html, "og:image:secure_url").forEach(push);
  metaAll(html, "twitter:image").forEach(push);

  // 2. Галерея объявления: <img itemprop="image"> (src и data-src/lazy)
  const imgRe = /<img\b[^>]*itemprop=["']image["'][^>]*>/gi;
  let tag: RegExpExecArray | null;
  while ((tag = imgRe.exec(html))) {
    const t = tag[0];
    push(t.match(/\bdata-src=["']([^"']+)["']/i)?.[1]);
    push(t.match(/\bsrc=["']([^"']+)["']/i)?.[1]);
  }

  // 3. JSON-LD "image": "url" | ["url", ...]
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ld: RegExpExecArray | null;
  while ((ld = ldRe.exec(html))) {
    const block = ld[1];
    const imgRe2 = /"image"\s*:\s*("([^"]+)"|\[([^\]]*)\])/gi;
    let mm: RegExpExecArray | null;
    while ((mm = imgRe2.exec(block))) {
      if (mm[2]) push(mm[2]);
      else if (mm[3]) mm[3].match(/"([^"]+)"/g)?.forEach((q) => push(q.slice(1, -1)));
    }
  }

  return [...seen].slice(0, MAX_IMAGES);
}

function parseTitle(title: string): { make: string; model: string; year: number | null } {
  const t = title.replace(/\s+/g, " ").trim();
  const yearMatch = t.match(/\b(19[89]\d|20[0-3]\d)\b/);
  const year = yearMatch ? Number(yearMatch[1]) : null;

  // Ищем марку: самую раннюю в заголовке, при равенстве — самую длинную.
  let bestMake = "";
  let bestIdx = Infinity;
  let bestEnd = 0;
  for (const make of MAKES) {
    const re = new RegExp(`(^|[^\\p{L}])(${make.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=[^\\p{L}]|$)`, "iu");
    const m = t.match(re);
    if (m && m.index != null) {
      const idx = m.index + m[1].length;
      if (idx < bestIdx || (idx === bestIdx && make.length > bestMake.length)) {
        bestIdx = idx;
        bestMake = make;
        bestEnd = idx + m[2].length;
      }
    }
  }

  let make = bestMake;
  let model = "";
  if (make) {
    // Модель — от конца марки до запятой / года / цены.
    let rest = t.slice(bestEnd);
    const cut = rest.search(/,|\b(19[89]\d|20[0-3]\d)\b|\d[\d\s]{3,}/);
    if (cut > 0) rest = rest.slice(0, cut);
    model = rest.replace(/[·,–—-]+$/g, "").trim();
    // Нормализуем регистр марки к каноничному написанию из списка
    make = MAKES.find((mk) => mk.toLowerCase() === make.toLowerCase()) ?? make;
  }
  return { make, model, year };
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!rateLimit(`car-lookup:${clientIp(request)}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, reason: "Слишком много запросов, попробуйте позже" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  let url: URL;
  try {
    url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ ok: false, reason: "Некорректная ссылка" }, { status: 400 });
  }

  function isPrivateHost(h: string): boolean {
    const x = h.replace(/^\[|\]$/g, "");
    return (
      h === "localhost" ||
      /^127\./.test(h) ||
      /^0\./.test(h) ||
      /^10\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^169\.254\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      h === "::1" ||
      x.startsWith("fe80") ||
      /^f[cd][0-9a-f]{2}:/i.test(x)
    );
  }
  if (isPrivateHost(url.hostname.toLowerCase())) {
    return NextResponse.json({ ok: false, reason: "Недопустимый адрес" }, { status: 400 });
  }

  try {
    // Сами идём по редиректам (до 4 переходов), но на КАЖДОМ шаге заново
    // проверяем, что хост публичный — так и совместимость с http→https, и
    // защита от SSRF через редирект.
    let current = url;
    let res: Response | null = null;
    for (let hop = 0; hop < 4; hop++) {
      if (isPrivateHost(current.hostname.toLowerCase())) {
        return NextResponse.json({ ok: false, reason: "Недопустимый адрес" }, { status: 400 });
      }
      res = await fetch(current, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "ru,en;q=0.8",
        },
        signal: AbortSignal.timeout(12000),
        redirect: "manual",
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) break;
        current = new URL(loc, current);
        continue;
      }
      break;
    }
    if (!res || !res.ok) {
      return NextResponse.json({
        ok: false,
        reason: `Сайт ответил ${res?.status ?? "ошибкой"} — заполните карточку вручную`,
      });
    }

    const html = (await res.text()).slice(0, 800_000);

    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null;
    const rawTitle = metaContent(html, "og:title") ?? metaContent(html, "twitter:title") ?? titleTag;
    const title = rawTitle ? decodeEntities(rawTitle).trim() : null;
    const descRaw = metaContent(html, "og:description") ?? metaContent(html, "description");
    const description = descRaw ? decodeEntities(descRaw).trim() : null;
    const priceRaw = metaContent(html, "product:price:amount") ?? metaContent(html, "og:price:amount");
    const price = priceRaw ? Number(priceRaw.replace(/[^\d.]/g, "")) || null : null;

    const images = collectImages(html, metaAll(html, "og:image"));
    const parsed = title ? parseTitle(title) : { make: "", model: "", year: null };

    return NextResponse.json({
      ok: true,
      data: {
        title,
        description,
        price,
        make: parsed.make || null,
        model: parsed.model || null,
        year: parsed.year,
        images,
      },
    });
  } catch {
    return NextResponse.json({
      ok: false,
      reason: "Сайт не ответил или заблокировал запрос — заполните карточку вручную",
    });
  }
}
