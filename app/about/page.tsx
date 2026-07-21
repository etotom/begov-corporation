import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "Begov Corporation — экспорт автомобилей из США, Европы и ОАЭ через Грузию в Центральную Азию и Россию. Собственная стоянка и парк автовозов.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display text-3xl font-bold">О компании</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Begov Corporation — экспортная компания из Грузии. Мы привозим автомобили с
            аукционов США, Европы и ОАЭ и доставляем их клиентам в Таджикистане, Узбекистане,
            Казахстане, Кыргызстане и России.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Наше главное отличие — собственная инфраструктура. У нас своя охраняемая стоянка в
            Грузии и свой парк трейлеров-автовозов. Это значит, что машина от порта до вашего
            города едет в наших руках, без цепочки посредников: мы отвечаем за сроки, сохранность
            и цену на каждом километре пути.
          </p>
        </div>
        <LogoMark className="mx-auto h-40 w-40 opacity-90" />
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {[
          ["Стоянка в Грузии", "Собственная охраняемая площадка: прием авто из порта, осмотр, хранение и подготовка к отправке."],
          ["Парк автовозов", "Свои трейлеры и опытные водители на маршрутах в Центральную Азию и Россию."],
          ["Команда закупки", "Специалисты по аукционам США, Европы и ОАЭ: подбор, проверка истории, торги."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display font-semibold text-accent">{t}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold">Наши принципы</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            ["Честная смета до сделки", "Все расходы фиксируются до покупки авто. Никаких «доплат по факту» — если смета меняется, только по согласованию с вами."],
            ["Отчет на каждом этапе", "Фото и видео с аукциона, из порта, со стоянки и при погрузке на автовоз. Вы всегда знаете, где ваша машина."],
            ["Работа по договору", "Каждая сделка оформляется документально. Деньги — только по официальным реквизитам."],
            ["Клиент возвращается", "Мы зарабатываем на повторных клиентах и рекомендациях, поэтому каждая доставка должна быть безупречной."],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-4 rounded-2xl border border-line bg-surface p-6">
              <span className="mt-1 text-accent">◆</span>
              <div>
                <h3 className="font-display font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <h2 className="font-display text-xl font-bold">Хотите увидеть всё своими глазами?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Приезжайте на нашу стоянку в Грузии или свяжитесь с менеджером — покажем машины,
          документы и ответим на любые вопросы.
        </p>
        <Link
          href="/contacts"
          className="mt-6 inline-block rounded-xl bg-accent px-8 py-3.5 font-bold text-background transition-colors hover:bg-accent-2"
        >
          Связаться с нами
        </Link>
      </div>
    </div>
  );
}
