import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' нужен: Next.js App Router встраивает инлайн-скрипты для
  // гидратации RSC-пейлоада — без этого сайт не оживёт на клиенте.
  // mc.yandex.ru — для Яндекс.Метрики (грузится только если задан счётчик).
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru",
  "style-src 'self' 'unsafe-inline'",
  // Фото авто грузятся из Vercel Blob (случайный поддомен) и — при импорте
  // объявления в админке — с произвольного внешнего сайта, поэтому https: широко.
  "img-src 'self' https: data:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.vercel-storage.com https://mc.yandex.ru https://mc.yandex.com",
  "frame-src https://mc.yandex.ru",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // /hero/*.jpg используют ?v= для сброса кэша при замене фото (lib/asset-version.ts)
    localPatterns: [{ pathname: "/hero/**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
