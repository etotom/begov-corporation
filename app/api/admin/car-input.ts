import { CAR_BODIES, CAR_SOURCES, CAR_STATUSES, MAX_CAR_PHOTOS, type CarInput } from "@/lib/cars";

// Валидация формы автомобиля из админки
export function carInputFromBody(
  body: unknown,
): { ok: true; value: CarInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Пустой запрос" };
  const b = body as Record<string, unknown>;

  const str = (k: string) => String(b[k] ?? "").trim();
  const num = (k: string) => Number(b[k] ?? 0);

  if (!str("make") || !str("model")) return { ok: false, error: "Укажите марку и модель" };
  const year = num("year");
  if (!Number.isInteger(year) || year < 1980 || year > 2035)
    return { ok: false, error: "Проверьте год выпуска" };
  const price = num("price");
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: "Проверьте цену" };

  const body_ = str("body");
  const source = str("source");
  const status = str("status");
  if (!CAR_BODIES.includes(body_ as never)) return { ok: false, error: "Неверный тип кузова" };
  if (!CAR_SOURCES.includes(source as never)) return { ok: false, error: "Неверный регион" };
  if (!CAR_STATUSES.includes(status as never)) return { ok: false, error: "Неверный статус" };

  return {
    ok: true,
    value: {
      make: str("make"),
      model: str("model"),
      year,
      price: Math.round(price),
      mileageKm: Math.max(0, Math.round(num("mileageKm"))),
      engine: str("engine"),
      fuel: str("fuel") || "Бензин",
      gearbox: str("gearbox") || "Автомат",
      drive: str("drive") || "Передний",
      body: body_ as CarInput["body"],
      color: str("color"),
      source: source as CarInput["source"],
      status: status as CarInput["status"],
      photos: Array.isArray(b.photos)
        ? b.photos.map((p) => String(p ?? "").trim()).filter(Boolean).slice(0, MAX_CAR_PHOTOS)
        : [],
      listingUrl: str("listingUrl") || null,
      visible: b.visible !== false,
    },
  };
}
