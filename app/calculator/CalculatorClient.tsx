"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { saveLead } from "@/lib/leads";

// Ориентировочные ставки (USD). Реальные тарифы правит менеджер — файл один,
// цифры собраны здесь, чтобы их было легко обновлять.
const RATES = {
  sources: {
    США: { auctionFixed: 950, auctionPct: 0.06, toGeorgia: 1950 },
    Европа: { auctionFixed: 600, auctionPct: 0.04, toGeorgia: 1100 },
    ОАЭ: { auctionFixed: 500, auctionPct: 0.04, toGeorgia: 1450 },
  },
  bodyFactor: { Седан: 1, Кроссовер: 1.1, Внедорожник: 1.25 },
  georgiaPort: 350, // порт, экспедирование, стоянка
  serviceFee: 500, // услуги компании
  toCity: {
    "Душанбе 🇹🇯": 1700,
    "Худжанд 🇹🇯": 1600,
    "Ташкент 🇺🇿": 1400,
    "Самарканд 🇺🇿": 1450,
    "Алматы 🇰🇿": 1300,
    "Астана 🇰🇿": 1600,
    "Шымкент 🇰🇿": 1250,
    "Бишкек 🇰🇬": 1350,
    "Ош 🇰🇬": 1500,
    "Москва 🇷🇺": 1500,
  },
} as const;

type Source = keyof typeof RATES.sources;
type Body = keyof typeof RATES.bodyFactor;
type City = keyof typeof RATES.toCity;

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function CalculatorClient() {
  const [source, setSource] = useState<Source>("США");
  const [body, setBody] = useState<Body>("Седан");
  const [city, setCity] = useState<City>("Душанбе 🇹🇯");
  const [priceStr, setPriceStr] = useState("12000");
  const [sent, setSent] = useState(false);

  const price = Math.max(0, Number(priceStr.replace(/[^\d]/g, "")) || 0);

  const calc = useMemo(() => {
    const s = RATES.sources[source];
    const factor = RATES.bodyFactor[body];
    const auction = s.auctionFixed + price * s.auctionPct;
    const toGeorgia = s.toGeorgia * factor;
    const trailer = RATES.toCity[city] * factor;
    const total = price + auction + toGeorgia + RATES.georgiaPort + trailer + RATES.serviceFee;
    return {
      rows: [
        ["Цена автомобиля", price],
        ["Аукционные и брокерские сборы", auction],
        [`Доставка до Грузии (${source})`, toGeorgia],
        ["Порт, экспедирование, стоянка", RATES.georgiaPort],
        [`Автовоз до города (${city})`, trailer],
        ["Услуги Begov Corporation", RATES.serviceFee],
      ] as [string, number][],
      total,
    };
  }, [source, body, city, price]);

  function requestExact() {
    saveLead({
      type: "Расчет доставки",
      summary: `${source} → ${city}, ${body.toLowerCase()}, авто ~${fmt(price)}`,
      details: `Предварительная смета: ${fmt(calc.total)}`,
    });
    setSent(true);
  }

  const selectCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Калькулятор доставки</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Предварительная смета «под ключ» до вашего города. Точная стоимость зависит от аукциона,
        порта отправки и курса — финальную цену фиксирует менеджер до покупки.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Откуда везем</span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RATES.sources) as Source[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    source === s
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-line bg-surface text-muted hover:border-accent/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Тип кузова</span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RATES.bodyFactor) as Body[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBody(b)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    body === b
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-line bg-surface text-muted hover:border-accent/50"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Цена авто на аукционе, USD</span>
            <input
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              inputMode="numeric"
              className={selectCls}
              placeholder="Например: 12000"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Город доставки</span>
            <select value={city} onChange={(e) => setCity(e.target.value as City)} className={selectCls}>
              {(Object.keys(RATES.toCity) as City[]).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-surface">
          <div className="border-b border-line bg-surface-2 px-6 py-4">
            <span className="font-display text-sm font-semibold">Предварительная смета</span>
          </div>
          <dl className="divide-y divide-line/60 px-6">
            {calc.rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium">{fmt(value)}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-5">
            <span className="font-display font-semibold">Итого под ключ*</span>
            <span className="font-display text-2xl font-bold text-accent">{fmt(calc.total)}</span>
          </div>
          <div className="px-6 pb-6">
            {sent ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                Заявка сохранена! Менеджер свяжется с вами для точного расчета.{" "}
                <Link href="/contacts" className="font-semibold underline">
                  Оставить контакты →
                </Link>
              </div>
            ) : (
              <button
                onClick={requestExact}
                className="w-full rounded-xl bg-accent px-6 py-3.5 font-bold text-background transition-colors hover:bg-accent-2"
              >
                Запросить точный расчет
              </button>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted">
              * Без таможенных платежей страны назначения — они зависят от года выпуска, объема
              двигателя и таможенных правил вашей страны. Менеджер посчитает их отдельно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
