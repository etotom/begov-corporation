import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import TelegramButton from "@/components/TelegramButton";
import YandexMetrica from "@/components/YandexMetrica";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Begov Corporation — Auto Export | Авто из США, Европы и ОАЭ под ключ",
    template: "%s — Begov Corporation",
  },
  description:
    "Подбор и доставка автомобилей с аукционов США, Европы и ОАЭ через Грузию в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию. Собственная стоянка и автовозы. Проверка по VIN, калькулятор доставки.",
  applicationName: SITE_NAME,
  keywords: [
    "авто из США",
    "авто из Европы",
    "авто из ОАЭ",
    "аукцион Copart IAAI",
    "доставка авто Таджикистан",
    "доставка авто Узбекистан",
    "доставка авто Казахстан",
    "авто Грузия Поти",
    "Begov Corporation",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Begov Corporation — Auto Export",
    description:
      "Авто из США, Европы и ОАЭ под ключ: аукцион → Грузия → ваш город. Собственная стоянка и автовозы.",
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Begov Corporation — Auto Export",
    description: "Авто из США, Европы и ОАЭ под ключ: аукцион → Грузия → ваш город.",
  },
};

// Schema.org — помогает Google/Яндексу понять, что это авто-дилер, и показать
// богатый сниппет (название, контакты, регион работы).
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: SITE_NAME,
  description:
    "Экспорт автомобилей с аукционов США, Европы и ОАЭ через Грузию в Центральную Азию и Россию.",
  url: SITE_URL,
  areaServed: ["TJ", "UZ", "KZ", "KG", "RU"],
  address: { "@type": "PostalAddress", addressCountry: "GE", addressLocality: "Тбилиси" },
  sameAs: ["https://t.me/begovcorp_bot"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <TelegramButton />
          <WhatsAppButton />
        </AuthProvider>
        <Analytics />
        <YandexMetrica />
      </body>
    </html>
  );
}
