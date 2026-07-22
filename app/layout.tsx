import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import TelegramButton from "@/components/TelegramButton";

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
  title: {
    default: "Begov Corporation — Auto Export | Авто из США, Европы и ОАЭ под ключ",
    template: "%s — Begov Corporation",
  },
  description:
    "Подбор и доставка автомобилей с аукционов США, Европы и ОАЭ через Грузию в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию. Собственная стоянка и автовозы. Проверка по VIN, калькулятор доставки.",
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
  openGraph: {
    title: "Begov Corporation — Auto Export",
    description:
      "Авто из США, Европы и ОАЭ под ключ: аукцион → Грузия → ваш город. Собственная стоянка и автовозы.",
    type: "website",
    locale: "ru_RU",
  },
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
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <TelegramButton />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
