import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Подбор авто на аукционах США, Европы и ОАЭ, выкуп, доставка в Грузию, стоянка, автовозы в Центральную Азию и Россию, оформление документов.",
};

const SERVICES = [
  {
    title: "Подбор и выкуп на аукционах",
    text: "Работаем с Copart, IAAI, Manheim (США), европейскими площадками и рынком ОАЭ. Анализируем историю лота, оцениваем повреждения и реальную стоимость восстановления, торгуемся за вас и выкупаем авто.",
    points: ["Отчет по каждому лоту до ставки", "Ставки в рамках вашего бюджета", "Оплата по договору"],
  },
  {
    title: "Международная логистика",
    text: "Организуем доставку из США и ОАЭ морем до Поти, из Европы — автовозом или морем. Страхуем груз, отслеживаем контейнер и держим вас в курсе на каждом этапе.",
    points: ["Море: контейнер или Ro-Ro", "Фото/видео при погрузке и выгрузке", "Отслеживание маршрута"],
  },
  {
    title: "Стоянка и осмотр в Грузии",
    text: "Собственная охраняемая стоянка. Принимаем авто из порта, проводим осмотр, при необходимости организуем ремонт, детейлинг и предпродажную подготовку.",
    points: ["Охраняемая площадка", "Дефектовка и фотоотчет", "Ремонт по согласованию"],
  },
  {
    title: "Автовозы до вашего города",
    text: "Собственные трейлеры возят автомобили из Грузии в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию. Без перекупщиков логистики — быстрее и дешевле.",
    points: ["Свой автопарк", "Опытные водители и проверенные маршруты", "Страховка при перевозке"],
  },
  {
    title: "Документы и оформление",
    text: "Готовим экспортные документы Грузии, помогаем с договором купли-продажи и консультируем по растаможке в стране назначения.",
    points: ["Экспортная декларация", "Полный пакет для растаможки", "Консультация по платежам"],
  },
  {
    title: "Продажа авто в наличии",
    text: "На стоянке всегда есть готовые автомобили — можно купить без ожидания аукциона и доставки из-за океана. Смотрите каталог или приезжайте лично.",
    points: ["Авто уже в Грузии", "Проверенная история", "Отправка в ваш город сразу после оплаты"],
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Услуги</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Полный цикл: от ставки на аукционе до ключей в вашем городе. Можно заказать как всё
        под ключ, так и отдельные услуги — например, только доставку автовозом из Грузии.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-line bg-surface p-7">
            <div className="font-display text-sm font-bold text-accent">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h2 className="font-display mt-3 text-lg font-semibold">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
            <ul className="mt-4 space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-accent">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <h2 className="font-display text-xl font-bold">Не знаете, с чего начать?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Напишите нам бюджет и пожелания — предложим 3–5 вариантов с полным расчетом стоимости
          до вашего города.
        </p>
        <Link
          href="/contacts"
          className="mt-6 inline-block rounded-xl bg-accent px-8 py-3.5 font-bold text-white transition-colors hover:bg-accent-2"
        >
          Получить подборку авто
        </Link>
      </div>
    </div>
  );
}
