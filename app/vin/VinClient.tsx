"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { saveLead } from "@/lib/leads";

interface VinField {
  label: string;
  value: string;
}

export default function VinClient() {
  const { user } = useAuth();
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VinField[] | null>(null);
  const [checkedVin, setCheckedVin] = useState("");

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [reqPhone, setReqPhone] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [reqConsent, setReqConsent] = useState(false);
  const [reqError, setReqError] = useState("");

  const findField = (label: string) => result?.find((f) => f.label === label)?.value ?? "";
  const carSummary = [findField("Марка"), findField("Модель"), findField("Год выпуска")]
    .filter(Boolean)
    .join(" ");
  const photoSearchUrl = carSummary
    ? `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(carSummary)}`
    : "";

  function sendPhotoRequest(e: React.FormEvent) {
    e.preventDefault();
    const phone = reqPhone.trim() || user?.phone || "";
    if (!phone) {
      setReqError("Укажите телефон, чтобы менеджер мог с вами связаться.");
      return;
    }
    if (!reqConsent) {
      setReqError("Нужно согласиться на обработку персональных данных.");
      return;
    }
    setReqError("");
    saveLead({
      type: "Фото и ДТП по VIN",
      summary: `${carSummary || "Авто"} — VIN ${checkedVin}`,
      details: reqMessage.trim(),
      name: user?.name ?? "",
      phone,
      country: user?.country ?? "",
    });
    setRequestSent(true);
  }

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setRequestOpen(false);
    setRequestSent(false);
    setReqPhone("");
    setReqMessage("");
    setReqError("");
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
          className="rounded-xl bg-accent px-8 py-3.5 font-bold text-white transition-colors hover:bg-accent-2 disabled:opacity-60"
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
          <div className="border-t border-line bg-surface-2 px-5 py-4">
            <p className="text-xs leading-relaxed text-muted">
              Это заводские данные — фото конкретного авто и историю ДТП база NHTSA не хранит.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {photoSearchUrl && (
                <a
                  href={photoSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-line px-4 py-2 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  🔍 Посмотреть фото {carSummary} в интернете
                </a>
              )}
              {!requestOpen && !requestSent && (
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-2"
                >
                  📸 Запросить фото и ДТП у менеджера
                </button>
              )}
            </div>

            {requestOpen && !requestSent && (
              <form onSubmit={sendPhotoRequest} className="mt-4 space-y-3 border-t border-line pt-4">
                <p className="text-xs leading-relaxed text-muted">
                  Поможем запросить фото этого конкретного автомобиля (с аукциона) и отчет по
                  истории ДТП, пробегу и владельцам (Carfax/AutoCheck) — по согласованию с
                  менеджером и при наличии данных по конкретному лоту.
                </p>
                <input
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  placeholder={user?.phone ? `Телефон (${user.phone})` : "Телефон (WhatsApp / Telegram) *"}
                  className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                />
                <textarea
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  rows={2}
                  placeholder="Уточнения (необязательно)"
                  className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                />
                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted">
                  <input
                    type="checkbox"
                    checked={reqConsent}
                    onChange={(e) => setReqConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                  />
                  <span>
                    Согласен(на) на обработку персональных данных согласно{" "}
                    <a href="/privacy" className="font-semibold text-accent hover:underline">
                      Политике конфиденциальности
                    </a>
                  </span>
                </label>
                {reqError && <p className="text-xs text-red-400">{reqError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-2"
                  >
                    Отправить запрос
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestOpen(false)}
                    className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-muted hover:text-foreground"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            {requestSent && (
              <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs leading-relaxed text-emerald-300">
                Заявка отправлена! Менеджер свяжется с вами и поможет с фото и историей ДТП по
                этому VIN, если они доступны по конкретному лоту.
              </div>
            )}
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
