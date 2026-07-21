import Link from "next/link";
import CarCard from "@/components/CarCard";
import HeroIllustration from "@/components/HeroIllustration";
import Reveal from "@/components/Reveal";
import { getVisibleCars } from "@/lib/db";

// Блок «Авто в наличии» обновляется из БД раз в 2 минуты
export const revalidate = 120;

const STEPS = [
  {
    n: "01",
    title: "Заявка и подбор",
    text: "Вы говорите бюджет и пожелания — мы находим варианты на аукционах США, Европы и ОАЭ и присылаем отчеты.",
  },
  {
    n: "02",
    title: "Проверка и торги",
    text: "Проверяем историю по VIN, оцениваем повреждения, делаем ставки и выкупаем авто по лучшей цене.",
  },
  {
    n: "03",
    title: "Доставка в Грузию",
    text: "Морем или автовозом машина едет в порт Поти. На каждом этапе — фото- и видеоотчет.",
  },
  {
    n: "04",
    title: "Стоянка и осмотр",
    text: "Авто прибывает на нашу собственную стоянку в Грузии: осмотр, при необходимости — ремонт и детейлинг.",
  },
  {
    n: "05",
    title: "Автовоз до вашего города",
    text: "Наши трейлеры везут авто в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию.",
  },
  {
    n: "06",
    title: "Передача и документы",
    text: "Помогаем с оформлением, передаем автомобиль и полный пакет документов лично вам.",
  },
];

const WHY = [
  {
    icon: (
      <path d="M3 13l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5v6a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm4.5 1.5h.01M16.5 14.5h.01" />
    ),
    title: "Собственные автовозы",
    text: "Не перекупаем логистику: наши трейлеры сами везут авто из Грузии до вашего города. Меньше посредников — ниже цена и выше контроль.",
  },
  {
    icon: <path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M2 21h20" />,
    title: "Стоянка в Грузии",
    text: "Своя охраняемая площадка: машины ждут отправки под присмотром, можно приехать и посмотреть авто вживую.",
  },
  {
    icon: <path d="M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4" />,
    title: "Полный цикл под ключ",
    text: "Аукцион, проверка, выкуп, море, таможня Грузии, автовоз, документы — один договор и один ответственный за всё.",
  },
  {
    icon: <path d="M12 8v5l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" />,
    title: "Прозрачность на каждом шаге",
    text: "Фиксируем смету до покупки, присылаем фото и видео на каждом этапе, все платежи — по документам.",
  },
];

const GEO = [
  { flag: "🇹🇯", country: "Таджикистан", cities: "Душанбе · Худжанд" },
  { flag: "🇺🇿", country: "Узбекистан", cities: "Ташкент · Самарканд" },
  { flag: "🇰🇿", country: "Казахстан", cities: "Алматы · Астана · Шымкент" },
  { flag: "🇰🇬", country: "Кыргызстан", cities: "Бишкек · Ош" },
  { flag: "🇷🇺", country: "Россия", cities: "Москва и регионы" },
];

export default async function Home() {
  const cars = await getVisibleCars();
  const featured = [
    ...cars.filter((c) => c.status === "В наличии в Грузии"),
    ...cars.filter((c) => c.status !== "В наличии в Грузии"),
  ].slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-hero border-b border-line overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-6 lg:pb-8">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.3em] text-accent uppercase">
              Georgia 🇬🇪 · Auto Export
            </p>
            <h1 className="font-display mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
              Авто из США, Европы и ОАЭ — <span className="text-gold">под ключ до вашего города</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Подбираем и выкупаем автомобили на аукционах, доставляем через Грузию и везем
              собственными автовозами в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию.
              Один договор — полная ответственность за результат.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/contacts"
                className="rounded-xl bg-accent px-7 py-3.5 font-bold text-background transition-colors hover:bg-accent-2 hover:scale-[1.03] active:scale-[0.98] transition-transform"
              >
                Подобрать авто
              </Link>
              <Link
                href="/calculator"
                className="rounded-xl border border-line px-7 py-3.5 font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                Рассчитать доставку
              </Link>
            </div>
          </div>

          <HeroIllustration className="w-full max-w-xl justify-self-center lg:justify-self-end" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20 lg:pb-24">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["3 региона", "закупки: США · Европа · ОАЭ"],
              ["5 стран", "доставки в СНГ и Азию"],
              ["Свои автовозы", "и охраняемая стоянка"],
              ["Под ключ", "от аукциона до документов"],
            ].map(([big, small], i) => (
              <Reveal key={big} delay={i * 80}>
                <div className="card-glow rounded-xl border border-line bg-surface/60 p-4 transition-shadow">
                  <div className="font-display text-lg font-bold text-accent">{big}</div>
                  <div className="mt-1 text-xs text-muted">{small}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Инструменты */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/vin"
            className="card-glow group rounded-2xl border border-line bg-surface p-7 transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-accent/15 p-3 text-accent">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3M8 11h6M11 8v6" strokeLinecap="round" />
                </svg>
              </span>
              <h2 className="font-display text-lg font-semibold group-hover:text-accent">
                Проверка по VIN — бесплатно
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Введите 17-значный VIN и получите характеристики автомобиля: марка, модель,
              двигатель, комплектация, страна сборки. Прямо на сайте, без регистрации.
            </p>
            <span className="mt-5 inline-block text-sm font-bold text-accent">Проверить VIN →</span>
          </Link>

          <Link
            href="/calculator"
            className="card-glow group rounded-2xl border border-line bg-surface p-7 transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-accent/15 p-3 text-accent">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
                  <path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" strokeLinecap="round" />
                </svg>
              </span>
              <h2 className="font-display text-lg font-semibold group-hover:text-accent">
                Калькулятор доставки
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Ориентировочная смета за минуту: аукционные сборы, доставка до Грузии и автовоз
              до вашего города — с разбивкой по статьям.
            </p>
            <span className="mt-5 inline-block text-sm font-bold text-accent">Рассчитать →</span>
          </Link>
        </div>
      </section>

      {/* Как это работает */}
      <section className="border-y border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Как это работает</h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Шесть шагов от заявки до ключей в руках — обычно 30–60 дней в зависимости от маршрута.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={(i % 3) * 100}>
                <div className="card-glow h-full rounded-2xl border border-line bg-surface p-6 transition-shadow">
                  <div className="font-display text-sm font-bold text-accent">{s.n}</div>
                  <h3 className="font-display mt-3 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Авто в наличии */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Авто в наличии</h2>
            <p className="mt-3 text-sm text-muted">
              Уже на нашей стоянке в Грузии — готовы к отправке в ваш город.
            </p>
          </div>
          <Link href="/catalog" className="shrink-0 text-sm font-bold text-accent hover:underline">
            Весь каталог →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* Почему мы */}
      <section className="border-y border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Почему Begov Corporation</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 120}>
                <div className="card-glow flex h-full gap-5 rounded-2xl border border-line bg-surface p-6 transition-shadow">
                  <span className="h-fit rounded-xl bg-accent/15 p-3 text-accent">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      {w.icon}
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{w.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{w.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* География */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">География доставки</h2>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Маршрут: аукцион → порт → Поти / Тбилиси (Грузия) → автовоз до вашего города.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GEO.map((g, i) => (
            <Reveal key={g.country} delay={i * 70}>
              <div className="card-glow rounded-2xl border border-line bg-surface p-5 text-center transition-all hover:-translate-y-1">
                <div className="text-3xl">{g.flag}</div>
                <div className="font-display mt-3 text-sm font-semibold">{g.country}</div>
                <div className="mt-1.5 text-xs text-muted">{g.cities}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-hero">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="font-display mx-auto max-w-2xl text-2xl font-bold sm:text-4xl">
            Готовы найти <span className="text-gold">ваш автомобиль</span>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Оставьте заявку — менеджер подберет варианты под ваш бюджет и посчитает точную
            смету доставки до вашего города.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/contacts"
              className="rounded-xl bg-accent px-8 py-3.5 font-bold text-background transition-colors hover:bg-accent-2"
            >
              Оставить заявку
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl border border-line px-8 py-3.5 font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Создать личный кабинет
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
