// Единый источник правды по адресу/названию сайта. Когда купите домен .com —
// задайте NEXT_PUBLIC_SITE_URL в переменных окружения Vercel, и все
// SEO-теги/sitemap/OG подхватят его без правок кода.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://begov-corporation.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Begov Corporation";
export const SITE_TAGLINE = "Авто из США, Европы и ОАЭ под ключ";
