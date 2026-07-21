import "server-only";

// Best-effort лимитер в памяти процесса: не переживает холодный старт и не
// шарится между несколькими инстансами функции, но с Fluid Compute (инстансы
// переиспользуются между запросами) реально режет брутфорс/спам в большинстве
// случаев. Для гарантированной защиты при росте нагрузки — Upstash Redis или
// Vercel Firewall rate-limit правила поверх этого.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
