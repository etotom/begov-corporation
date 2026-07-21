"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CarCard from "@/components/CarCard";
import { CARS, type CarBody, type CarSource, type CarStatus } from "@/lib/cars";

const SOURCES: (CarSource | "Все")[] = ["Все", "США", "Европа", "ОАЭ"];
const BODIES: (CarBody | "Все")[] = ["Все", "Седан", "Кроссовер", "Внедорожник"];
const STATUSES: (CarStatus | "Все")[] = ["Все", "В наличии в Грузии", "В пути", "Под заказ"];

export default function CatalogClient() {
  const [source, setSource] = useState<(typeof SOURCES)[number]>("Все");
  const [body, setBody] = useState<(typeof BODIES)[number]>("Все");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("Все");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc" | "year-desc">("default");
  const [query, setQuery] = useState("");

  const cars = useMemo(() => {
    let list = CARS.filter(
      (c) =>
        (source === "Все" || c.source === source) &&
        (body === "Все" || c.body === body) &&
        (status === "Все" || c.status === status) &&
        (query.trim() === "" ||
          `${c.make} ${c.model}`.toLowerCase().includes(query.trim().toLowerCase())),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "year-desc") list = [...list].sort((a, b) => b.year - a.year);
    return list;
  }, [source, body, status, sort, query]);

  const selectCls =
    "rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Каталог автомобилей</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Часть машин уже в Грузии, часть — в пути. Не нашли нужную модель? Привезем под заказ
        с аукционов США, Европы и ОАЭ —{" "}
        <Link href="/contacts" className="font-semibold text-accent hover:underline">
          оставьте заявку на подбор
        </Link>
        .
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: марка или модель"
          className={selectCls}
        />
        <select value={source} onChange={(e) => setSource(e.target.value as never)} className={selectCls}>
          {SOURCES.map((s) => (
            <option key={s}>{s === "Все" ? "Регион: все" : s}</option>
          ))}
        </select>
        <select value={body} onChange={(e) => setBody(e.target.value as never)} className={selectCls}>
          {BODIES.map((b) => (
            <option key={b}>{b === "Все" ? "Кузов: все" : b}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as never)} className={selectCls}>
          {STATUSES.map((s) => (
            <option key={s}>{s === "Все" ? "Статус: все" : s}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as never)} className={selectCls}>
          <option value="default">Сортировка</option>
          <option value="price-asc">Сначала дешевле</option>
          <option value="price-desc">Сначала дороже</option>
          <option value="year-desc">Сначала новее</option>
        </select>
      </div>

      {cars.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="font-display font-semibold">По этим фильтрам ничего не нашлось</p>
          <p className="mt-2 text-sm text-muted">
            Сбросьте фильтры или закажите подбор — найдем именно то, что нужно.
          </p>
          <Link
            href="/contacts"
            className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-background hover:bg-accent-2"
          >
            Заказать подбор
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}

      <p className="mt-10 text-xs leading-relaxed text-muted">
        * Цены указаны за автомобиль с доставкой до Грузии (Поти) и являются ориентировочными.
        Итоговая стоимость с доставкой в ваш город и оформлением рассчитывается менеджером.
        Фотографии конкретных автомобилей высылаем по запросу.
      </p>
    </div>
  );
}
