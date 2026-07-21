"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CAR_BODIES,
  CAR_SOURCES,
  CAR_STATUSES,
  formatKm,
  formatPrice,
  type Car,
} from "@/lib/cars";
import type { DbLead } from "@/lib/db";

type Tab = "leads" | "cars";

const emptyForm = {
  make: "",
  model: "",
  year: String(new Date().getFullYear() - 3),
  price: "",
  mileageKm: "",
  engine: "",
  fuel: "Бензин",
  gearbox: "Автомат",
  drive: "Передний",
  body: "Седан",
  color: "",
  source: "США",
  status: "В наличии в Грузии",
  photoUrl: "",
  listingUrl: "",
  visible: true,
};

type CarForm = typeof emptyForm;

function carToForm(c: Car): CarForm {
  return {
    make: c.make,
    model: c.model,
    year: String(c.year),
    price: String(c.price),
    mileageKm: String(c.mileageKm),
    engine: c.engine,
    fuel: c.fuel,
    gearbox: c.gearbox,
    drive: c.drive,
    body: c.body,
    color: c.color,
    source: c.source,
    status: c.status,
    photoUrl: c.photoUrl ?? "",
    listingUrl: c.listingUrl ?? "",
    visible: c.visible,
  };
}

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

const STATUS_COLOR: Record<string, string> = {
  "В наличии в Грузии": "bg-emerald-500/15 text-emerald-400",
  "В пути": "bg-sky-500/15 text-sky-400",
  "Под заказ": "bg-violet-500/15 text-violet-400",
};

export default function AdminClient({
  initialCars,
  initialLeads,
}: {
  initialCars: Car[];
  initialLeads: DbLead[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("leads");
  const [cars, setCars] = useState(initialCars);
  const [leads, setLeads] = useState(initialLeads);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CarForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lookupUrl, setLookupUrl] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMsg, setLookupMsg] = useState("");
  const [lookupHint, setLookupHint] = useState<{ title: string | null; description: string | null } | null>(null);

  const newLeads = useMemo(() => leads.filter((l) => l.status === "new").length, [leads]);
  const hiddenCars = useMemo(() => cars.filter((c) => !c.visible).length, [cars]);

  const set = (key: keyof CarForm) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setLookupHint(null);
    setFormOpen(true);
  }

  function openEdit(car: Car) {
    setEditingId(car.id);
    setForm(carToForm(car));
    setFormError("");
    setLookupHint(null);
    setFormOpen(true);
  }

  async function lookupListing() {
    const url = lookupUrl.trim();
    if (!url) return;
    setLookupLoading(true);
    setLookupMsg("");
    setLookupHint(null);
    try {
      const res = await fetch("/api/admin/car-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setEditingId(null);
      setFormError("");
      if (data.ok) {
        setForm({
          ...emptyForm,
          listingUrl: url,
          photoUrl: data.data.image ?? "",
          price: data.data.price ? String(data.data.price) : "",
        });
        setLookupHint({ title: data.data.title, description: data.data.description });
        setLookupMsg(
          data.data.title || data.data.image
            ? "Подтянули то, что сайт публикует открыто (см. подсказку ниже) — марку, модель и остальное впишите сами."
            : "Сайт не отдал ни заголовка, ни фото — заполните карточку вручную.",
        );
      } else {
        setForm({ ...emptyForm, listingUrl: url });
        setLookupMsg(data.reason ?? "Не удалось получить данные — заполните вручную.");
      }
      setFormOpen(true);
    } catch {
      setForm({ ...emptyForm, listingUrl: url });
      setFormOpen(true);
      setLookupMsg("Ошибка соединения — заполните вручную.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function saveCar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      mileageKm: Number(form.mileageKm || 0),
    };
    try {
      const res = await fetch(editingId ? `/api/admin/cars/${editingId}` : "/api/admin/cars", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        setFormError(data.error ?? "Не удалось сохранить");
        return;
      }
      setCars((prev) =>
        editingId ? prev.map((c) => (c.id === editingId ? data.car : c)) : [data.car, ...prev],
      );
      setFormOpen(false);
    } catch {
      setFormError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(car: Car) {
    const res = await fetch(`/api/admin/cars/${car.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...carToForm(car), year: car.year, price: car.price, mileageKm: car.mileageKm, visible: !car.visible }),
    });
    const data = await res.json();
    if (data.ok) setCars((prev) => prev.map((c) => (c.id === car.id ? data.car : c)));
  }

  async function removeCar(car: Car) {
    if (!confirm(`Удалить ${car.make} ${car.model} ${car.year}? Это действие необратимо.`)) return;
    const res = await fetch(`/api/admin/cars/${car.id}`, { method: "DELETE" });
    if ((await res.json()).ok) setCars((prev) => prev.filter((c) => c.id !== car.id));
  }

  async function toggleLead(lead: DbLead) {
    const status = lead.status === "new" ? "done" : "new";
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if ((await res.json()).ok)
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
  }

  async function removeLead(lead: DbLead) {
    if (!confirm("Удалить заявку безвозвратно?")) return;
    const res = await fetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
    if ((await res.json()).ok) setLeads((prev) => prev.filter((l) => l.id !== lead.id));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Шапка */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Панель управления</h1>
          <p className="mt-1 text-sm text-muted">Заявки клиентов и каталог автомобилей</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
          >
            ← На сайт
          </Link>
          <button
            onClick={logout}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-red-400 hover:text-red-400"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          [String(newLeads), "новых заявок", newLeads > 0],
          [String(leads.length), "заявок всего", false],
          [String(cars.length), "авто в каталоге", false],
          [String(hiddenCars), "скрыто с сайта", false],
        ].map(([num, label, highlight]) => (
          <div
            key={label as string}
            className={`rounded-xl border p-4 ${
              highlight ? "border-accent/50 bg-accent/10" : "border-line bg-surface"
            }`}
          >
            <div className={`font-display text-2xl font-bold ${highlight ? "text-accent" : ""}`}>
              {num}
            </div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Вкладки */}
      <div className="mt-8 flex gap-2 border-b border-line">
        {(
          [
            ["leads", `Заявки${newLeads ? ` · ${newLeads}` : ""}`],
            ["cars", "Каталог"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Заявки */}
      {tab === "leads" && (
        <div className="mt-6 space-y-3">
          {leads.length === 0 && (
            <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-muted">
              Заявок пока нет. Они появятся здесь, как только клиент заполнит форму на сайте.
            </div>
          )}
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`rounded-2xl border p-5 ${
                lead.status === "new" ? "border-accent/40 bg-surface" : "border-line bg-surface/50 opacity-75"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-accent/15 px-2 py-1 text-[11px] font-bold text-accent">
                      {lead.type}
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                        lead.status === "new"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-line/60 text-muted"
                      }`}
                    >
                      {lead.status === "new" ? "Новая" : "Обработана"}
                    </span>
                    <time className="text-xs text-muted">
                      {new Date(lead.createdAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="mt-2.5 font-semibold">{lead.summary}</p>
                  {lead.details && <p className="mt-1 text-sm text-muted">{lead.details}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    {lead.name && <span>👤 {lead.name}</span>}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="font-medium text-accent hover:underline">
                        📞 {lead.phone}
                      </a>
                    )}
                    {lead.country && <span className="text-muted">🌍 {lead.country}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => toggleLead(lead)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold transition-colors hover:border-emerald-400 hover:text-emerald-400"
                  >
                    {lead.status === "new" ? "✓ Обработана" : "↺ Вернуть"}
                  </button>
                  <button
                    onClick={() => removeLead(lead)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-red-400 hover:text-red-400"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Каталог */}
      {tab === "cars" && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openCreate}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-2"
            >
              + Добавить авто
            </button>
            <span className="text-sm text-muted">или</span>
            <div className="flex flex-1 min-w-[260px] gap-2">
              <input
                value={lookupUrl}
                onChange={(e) => setLookupUrl(e.target.value)}
                placeholder="Ссылка на объявление (myauto.ge, autopapa.ge…)"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={lookupListing}
                disabled={lookupLoading || !lookupUrl.trim()}
                className="shrink-0 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {lookupLoading ? "Проверяем…" : "Проверить"}
              </button>
            </div>
          </div>
          {lookupMsg && <p className="mt-2 text-xs text-muted">{lookupMsg}</p>}

          {formOpen && (
            <form onSubmit={saveCar} className="mt-5 rounded-2xl border border-accent/40 bg-surface p-6">
              <h3 className="font-display font-semibold">
                {editingId ? "Редактировать авто" : "Новое авто"}
              </h3>
              {lookupHint && (lookupHint.title || lookupHint.description) && (
                <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs leading-relaxed text-muted">
                  <span className="font-bold text-accent">Из объявления: </span>
                  {lookupHint.title}
                  {lookupHint.description ? ` — ${lookupHint.description}` : ""}
                </div>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input value={form.make} onChange={(e) => set("make")(e.target.value)} placeholder="Марка (Toyota) *" className={inputCls} />
                <input value={form.model} onChange={(e) => set("model")(e.target.value)} placeholder="Модель (Camry SE) *" className={inputCls} />
                <input value={form.year} onChange={(e) => set("year")(e.target.value)} placeholder="Год *" inputMode="numeric" className={inputCls} />
                <input value={form.price} onChange={(e) => set("price")(e.target.value)} placeholder="Цена USD (до Грузии) *" inputMode="numeric" className={inputCls} />
                <input value={form.mileageKm} onChange={(e) => set("mileageKm")(e.target.value)} placeholder="Пробег, км" inputMode="numeric" className={inputCls} />
                <input value={form.engine} onChange={(e) => set("engine")(e.target.value)} placeholder="Двигатель (2.5 л)" className={inputCls} />
                <select value={form.fuel} onChange={(e) => set("fuel")(e.target.value)} className={inputCls}>
                  {["Бензин", "Дизель", "Гибрид", "Электро"].map((v) => <option key={v}>{v}</option>)}
                </select>
                <select value={form.gearbox} onChange={(e) => set("gearbox")(e.target.value)} className={inputCls}>
                  {["Автомат", "Механика", "Вариатор", "Робот"].map((v) => <option key={v}>{v}</option>)}
                </select>
                <select value={form.drive} onChange={(e) => set("drive")(e.target.value)} className={inputCls}>
                  {["Передний", "Задний", "Полный"].map((v) => <option key={v}>{v}</option>)}
                </select>
                <select value={form.body} onChange={(e) => set("body")(e.target.value)} className={inputCls}>
                  {CAR_BODIES.map((v) => <option key={v}>{v}</option>)}
                </select>
                <input value={form.color} onChange={(e) => set("color")(e.target.value)} placeholder="Цвет" className={inputCls} />
                <select value={form.source} onChange={(e) => set("source")(e.target.value)} className={inputCls}>
                  {CAR_SOURCES.map((v) => <option key={v}>{v}</option>)}
                </select>
                <select value={form.status} onChange={(e) => set("status")(e.target.value)} className={inputCls}>
                  {CAR_STATUSES.map((v) => <option key={v}>{v}</option>)}
                </select>
                <input value={form.photoUrl} onChange={(e) => set("photoUrl")(e.target.value)} placeholder="Ссылка на фото (https://…)" className={`${inputCls} sm:col-span-2`} />
                <input
                  value={form.listingUrl}
                  onChange={(e) => set("listingUrl")(e.target.value)}
                  placeholder="Ссылка на исходное объявление (не показывается на сайте)"
                  className={`${inputCls} sm:col-span-2 lg:col-span-3`}
                />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => set("visible")(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Показывать на сайте
              </label>
              {formError && <p className="mt-3 text-sm text-red-400">{formError}</p>}
              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-2 disabled:opacity-60"
                >
                  {saving ? "Сохраняем…" : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-line px-6 py-2.5 text-sm font-semibold text-muted hover:text-foreground"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 space-y-3">
            {cars.map((car) => (
              <div
                key={car.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 ${
                  car.visible ? "" : "opacity-60"
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  {car.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={car.photoUrl}
                      alt={`${car.make} ${car.model}`}
                      className="h-14 w-20 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-line bg-surface-2 text-lg">
                      🚗
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-display font-semibold">
                      {car.make} {car.model}{" "}
                      <span className="font-sans text-sm font-normal text-muted">{car.year}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-accent">{formatPrice(car.price)}</span>
                      <span className="text-muted">{formatKm(car.mileageKm)}</span>
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 font-bold text-accent">
                        {car.source}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 font-bold ${STATUS_COLOR[car.status] ?? ""}`}>
                        {car.status}
                      </span>
                      {!car.visible && (
                        <span className="rounded bg-red-500/15 px-1.5 py-0.5 font-bold text-red-400">
                          Скрыто
                        </span>
                      )}
                      {car.listingUrl && (
                        <a
                          href={car.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-accent"
                          title="Открыть исходное объявление"
                        >
                          🔗 источник
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => toggleVisible(car)}
                    title={car.visible ? "Скрыть с сайта" : "Показать на сайте"}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
                  >
                    {car.visible ? "Скрыть" : "Показать"}
                  </button>
                  <button
                    onClick={() => openEdit(car)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => removeCar(car)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-red-400 hover:text-red-400"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
