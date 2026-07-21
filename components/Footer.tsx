import Link from "next/link";
import Logo from "@/components/Logo";

const COUNTRIES = [
  { flag: "🇹🇯", name: "Таджикистан" },
  { flag: "🇺🇿", name: "Узбекистан" },
  { flag: "🇰🇿", name: "Казахстан" },
  { flag: "🇰🇬", name: "Кыргызстан" },
  { flag: "🇷🇺", name: "Россия" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Экспорт автомобилей из США, Европы и ОАЭ. Собственная стоянка и
            автовозы в Грузии — доставка под ключ в Центральную Азию и Россию.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Навигация
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/catalog", "Каталог автомобилей"],
              ["/vin", "Проверка по VIN"],
              ["/calculator", "Калькулятор доставки"],
              ["/services", "Услуги"],
              ["/about", "О компании"],
              ["/contacts", "Контакты"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-muted transition-colors hover:text-accent">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            География доставки
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {COUNTRIES.map((c) => (
              <li key={c.name}>
                <span className="mr-2">{c.flag}</span>
                {c.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Контакты
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>🇬🇪 Грузия, Тбилиси · стоянка в Поти</li>
            <li>
              <a href="tel:+995000000000" className="transition-colors hover:text-accent">
                +995 000 00 00 00
              </a>
            </li>
            <li>
              <a
                href="mailto:info@begov-corporation.com"
                className="transition-colors hover:text-accent"
              >
                info@begov-corporation.com
              </a>
            </li>
            <li className="pt-1 text-xs">WhatsApp · Telegram — по номеру телефона</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Begov Corporation. Все права защищены.</span>
          <span className="flex items-center gap-4">
            Auto Export · Georgia 🇬🇪
            <Link href="/admin" className="opacity-60 transition-opacity hover:opacity-100">
              Для сотрудников
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
