import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getVisibleCars } from "@/lib/db";

// Пересобираем раз в час, чтобы новые авто из каталога попадали в карту сайта.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "daily" },
    { path: "/catalog", priority: 0.9, freq: "daily" },
    { path: "/calculator", priority: 0.7, freq: "monthly" },
    { path: "/vin", priority: 0.7, freq: "monthly" },
    { path: "/services", priority: 0.6, freq: "monthly" },
    { path: "/faq", priority: 0.6, freq: "monthly" },
    { path: "/about", priority: 0.5, freq: "yearly" },
    { path: "/contacts", priority: 0.6, freq: "yearly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
    { path: "/terms", priority: 0.2, freq: "yearly" },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((s) => ({
    url: `${SITE_URL}${s.path}`,
    lastModified: new Date(),
    changeFrequency: s.freq,
    priority: s.priority,
  }));

  // Каждое видимое авто — отдельная страница /catalog/[id]. Если БД недоступна
  // на этапе сборки — отдаём только статические страницы, сборку не роняем.
  try {
    const cars = await getVisibleCars();
    for (const car of cars) {
      entries.push({
        url: `${SITE_URL}/catalog/${car.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // тихо игнорируем — вернём хотя бы статические маршруты
  }

  return entries;
}
