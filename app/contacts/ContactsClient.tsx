"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { saveLead } from "@/lib/leads";

const COUNTRIES = ["Таджикистан", "Узбекистан", "Казахстан", "Кыргызстан", "Россия", "Другая страна"];

export default function ContactsClient() {
  const params = useSearchParams();
  const carParam = params.get("car") ?? "";
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [message, setMessage] = useState(carParam ? `Интересует: ${carParam}` : "");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const finalName = name || user?.name || "";
    const finalPhone = phone || user?.phone || "";
    if (!finalName.trim() || !finalPhone.trim()) {
      setError("Укажите имя и номер телефона, чтобы мы могли связаться с вами.");
      return;
    }
    setError("");
    saveLead({
      type: carParam ? "Заявка по авто" : "Подбор авто",
      summary: carParam || "Заявка с формы контактов",
      details: message.trim(),
      name: finalName,
      phone: finalPhone,
      country,
    });
    setSent(true);
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Контакты</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Оставьте заявку — ответим в WhatsApp или Telegram в течение рабочего дня. Или свяжитесь
        с нами напрямую любым удобным способом.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          {sent ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8">
              <h2 className="font-display text-lg font-bold text-emerald-300">Заявка отправлена!</h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-200/80">
                Менеджер свяжется с вами в ближайшее время. Заявка также сохранена в вашем
                личном кабинете.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-7">
              <h2 className="font-display text-lg font-semibold">Заявка на подбор</h2>
              {carParam && (
                <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
                  🚗 {carParam}
                </div>
              )}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user ? `Имя (${user.name})` : "Ваше имя *"}
                className={inputCls}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={user?.phone ? `Телефон (${user.phone})` : "Телефон (WhatsApp / Telegram) *"}
                className={inputCls}
              />
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Какое авто ищете? Бюджет, марка, год…"
                className={inputCls}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-xl bg-accent px-6 py-3.5 font-bold text-white transition-colors hover:bg-accent-2"
              >
                Отправить заявку
              </button>
              <p className="text-xs text-muted">
                Нажимая кнопку, вы соглашаетесь на обработку контактных данных для связи по заявке.
              </p>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {[
            ["📍", "Адрес", "Грузия, Тбилиси · стоянка в Поти", null],
            ["📞", "Телефон / WhatsApp / Telegram", "+995 000 00 00 00", "tel:+995000000000"],
            ["✉️", "Email", "info@begov-corporation.com", "mailto:info@begov-corporation.com"],
            ["🕘", "Режим работы", "Пн–Сб 09:00–19:00 (GMT+4)", null],
          ].map(([icon, title, value, href]) => (
            <div key={title as string} className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="text-xs font-semibold tracking-wide text-muted uppercase">{title}</div>
                {href ? (
                  <a href={href as string} className="mt-1 block font-medium transition-colors hover:text-accent">
                    {value}
                  </a>
                ) : (
                  <div className="mt-1 font-medium">{value}</div>
                )}
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-line bg-surface-2 p-6 text-sm leading-relaxed text-muted">
            💬 Быстрее всего мы отвечаем в мессенджерах. Напишите нам в WhatsApp или Telegram —
            пришлем актуальные варианты авто с фото и точным расчетом.
          </div>
        </div>
      </div>
    </div>
  );
}
