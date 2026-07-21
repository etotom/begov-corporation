"use client";

import Link from "next/link";
import { useState } from "react";

interface VinField {
  label: string;
  value: string;
}

export default function VinClient() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VinField[] | null>(null);
  const [checkedVin, setCheckedVin] = useState("");

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const clean = vin.trim().toUpperCase();
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(clean)) {
      setError("VIN должен состоять из 17 символов: латинские буквы и цифры (без I, O, Q).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/vin?vin=${clean}`);
      const data = await res.json();
      if (data.ok) {
        setResult(data.result);
        setCheckedVin(clean);
      } else {
        setError(data.error ?? "Не удалось проверить VIN");
      }
    } catch {
      setError("Сервис временно недоступен, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Проверка по VIN</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Введите 17-значный VIN-код — покажем заводские характеристики автомобиля из базы NHTSA
        (Национальное управление безопасности дорожного движения США). Бесплатно и без регистрации.
      </p>

      <form onSubmit={check} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          maxLength={17}
          placeholder="Например: 4T1G11AK5MU443298"
          className="flex-1 rounded-xl border border-line bg-surface px-4 py-3.5 font-mono text-sm tracking-[0.15em] outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-8 py-3.5 font-bold text-background transition-colors hover:bg-accent-2 disabled:opacity-60"
        >
          {loading ? "Проверяем…" : "Проверить"}
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">Введено символов: {vin.trim().length} / 17</p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-4">
            <span className="font-display text-sm font-semibold">Результат проверки</span>
            <span className="font-mono text-xs tracking-widest text-accent">{checkedVin}</span>
          </div>
          <dl className="divide-y divide-line/60">
            {result.map((f) => (
              <div key={f.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <dt className="text-muted">{f.label}</dt>
                <dd className="text-right font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-line bg-surface-2 px-5 py-4 text-xs leading-relaxed text-muted">
            Это заводские данные. Полную историю (ДТП, пробег, количество владельцев, фото с
            аукциона по Carfax / AutoCheck) запросите у менеджера —{" "}
            <Link href="/contacts" className="font-semibold text-accent hover:underline">
              оставить заявку
            </Link>
            .
          </div>
        </div>
      )}

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["Заводские данные", "Марка, модель, год, двигатель, КПП, страна сборки"],
          ["Лучше всего — авто из США", "База NHTSA покрывает автомобили американского рынка"],
          ["Полный отчет — по запросу", "Carfax / AutoCheck с историей ДТП и пробегом — через менеджера"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-line bg-surface p-5">
            <div className="font-display text-sm font-semibold text-accent">{t}</div>
            <p className="mt-2 text-xs leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
