"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  CAR_BODIES,
  CAR_SOURCES,
  CAR_STATUSES,
  MAX_CAR_PHOTOS,
  formatKm,
  formatPrice,
  type Car,
} from "@/lib/cars";
import type { DbLead } from "@/lib/db";

type Tab = "leads" | "cars" | "admins";

// Грубое сопоставление терминов NHTSA vPIC с нашими вариантами в форме
function mapBody(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("suv") || s.includes("sport utility")) return "Внедорожник";
  if (s.includes("crossover") || s.includes("cuv")) return "Кроссовер";
  return "Седан";
}
function mapDrive(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("front") || s.includes("fwd")) return "Передний";
  if (s.includes("rear") || s.includes("rwd")) return "Задний";
  if (s.includes("all") || s.includes("awd") || s.includes("4wd") || s.includes("4x4")) return "Полный";
  return "Передний";
}
function mapFuel(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("diesel")) return "Дизель";
  if (s.includes("electric")) return "Электро";
  if (s.includes("hybrid")) return "Гибрид";
  return "Бензин";
}
function mapGearbox(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("cvt") || s.includes("continuously variable")) return "Вариатор";
  if (s.includes("automated manual") || s.includes("dual-clutch") || s.includes("dct") || s.includes("amt"))
    return "Робот";
  if (s.includes("manual")) return "Механика";
  return "Автомат";
}

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
  photos: [] as string[],
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
    photos: c.photos,
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
  const [vin, setVin] = useState("");
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

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
        const d = data.data;
        const photos: string[] = Array.isArray(d.images) ? d.images.slice(0, MAX_CAR_PHOTOS) : [];
        setForm({
          ...emptyForm,
          listingUrl: url,
          make: d.make ?? "",
          model: d.model ?? "",
          year: d.year ? String(d.year) : emptyForm.year,
          price: d.price ? String(d.price) : "",
          photos,
        });
        setLookupHint({ title: d.title, description: d.description });
        const got: string[] = [];
        if (d.make || d.model) got.push("марку и модель");
        if (d.year) got.push("год");
        if (photos.length) got.push(`${photos.length} фото`);
        setLookupMsg(
          got.length
            ? `✅ Подтянул: ${got.join(", ")}. Проверьте поля, впишите цену и пробег — лишние фото можно удалить, первое станет обложкой.`
            : "Сайт не отдал структурных данных — заполните карточку вручную (ссылка на объявление сохранена).",
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

  async function fillFromVin() {
    const clean = vin.trim().toUpperCase();
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(clean)) {
      setVinError("VIN должен состоять из 17 символов (латинские буквы и цифры, без I, O, Q).");
      return;
    }
    setVinLoading(true);
    setVinError("");
    try {
      const res = await fetch(`/api/vin?vin=${clean}`);
      const data = await res.json();
      if (!data.ok) {
        setVinError(data.error ?? "Не удалось расшифровать VIN");
        return;
      }
      const fields = data.result as { label: string; value: string }[];
      const get = (label: string) => fields.find((f) => f.label === label)?.value ?? "";

      const make = get("Марка");
      const model = [get("Модель"), get("Комплектация")].filter(Boolean).join(" ");
      const year = get("Год выпуска");
      const displacement = get("Объем двигателя, л");
      const bodyClass = get("Тип кузова");
      const driveType = get("Привод");
      const fuelType = get("Топливо");
      const transmission = get("Коробка передач");

      setForm((f) => ({
        ...f,
        make: make || f.make,
        model: model || f.model,
        year: year || f.year,
        engine: displacement ? `${displacement} л` : f.engine,
        body: bodyClass ? mapBody(bodyClass) : f.body,
        drive: driveType ? mapDrive(driveType) : f.drive,
        fuel: fuelType ? mapFuel(fuelType) : f.fuel,
        gearbox: transmission ? mapGearbox(transmission) : f.gearbox,
      }));
    } catch {
      setVinError("Сервис проверки VIN временно недоступен, попробуйте позже.");
    } finally {
      setVinLoading(false);
    }
  }

  async function handlePhotoFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const room = MAX_CAR_PHOTOS - form.photos.length;
    if (room <= 0) {
      setPhotoError(`Максимум ${MAX_CAR_PHOTOS} фото на авто.`);
      return;
    }
    const toUpload = files.slice(0, room);
    setPhotoError("");
    setPhotoUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const blob = await upload(`cars/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        uploaded.push(blob.url);
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...uploaded] }));
      if (files.length > room) {
        setPhotoError(`Загружено ${room} из ${files.length} — лимит ${MAX_CAR_PHOTOS} фото на авто.`);
      }
    } catch {
      setPhotoError("Не удалось загрузить одно из фото — попробуйте ещё раз.");
    } finally {
      setPhotoUploading(false);
    }
  }

  function removePhoto(url: string) {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== url) }));
  }

  function makeCoverPhoto(url: string) {
    setForm((f) => ({ ...f, photos: [url, ...f.photos.filter((p) => p !== url)] }));
  }

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    if (!confirm(`Сделать ${adminEmail} администратором? У аккаунта будет полный доступ к панели.`)) {
      return;
    }
    setAdminSaving(true);
    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!data.ok) {
        setAdminError(data.error ?? "Не удалось создать администратора");
        return;
      }
      setAdminSuccess(`Готово! ${data.user.email} теперь администратор.`);
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
    } catch {
      setAdminError("Ошибка соединения");
    } finally {
      setAdminSaving(false);
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
            ["admins", "Добавить администратора"],
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

              <div className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-line bg-background p-3">
                <div className="min-w-[220px] flex-1">
                  <label className="text-xs font-semibold text-muted">
                    Заполнить марку/модель/год по VIN
                  </label>
                  <input
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    maxLength={17}
                    placeholder="17 символов VIN"
                    className={`${inputCls} mt-1 font-mono tracking-wider`}
                  />
                </div>
                <button
                  type="button"
                  onClick={fillFromVin}
                  disabled={vinLoading || vin.trim().length !== 17}
                  className="shrink-0 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {vinLoading ? "Заполняем…" : "Заполнить по VIN"}
                </button>
              </div>
              {vinError && <p className="mt-1.5 text-xs text-red-400">{vinError}</p>}

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
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-semibold text-muted">
                    Фото ({form.photos.length}/{MAX_CAR_PHOTOS}) — первое фото становится обложкой
                  </label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {form.photos.map((url, i) => (
                      <div key={url} className="group relative h-20 w-28 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Фото ${i + 1}`}
                          className={`h-full w-full rounded-lg border-2 object-cover ${i === 0 ? "border-accent" : "border-line"}`}
                        />
                        {i === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                            Обложка
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-foreground/70 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {i !== 0 && (
                            <button
                              type="button"
                              onClick={() => makeCoverPhoto(url)}
                              title="Сделать обложкой"
                              className="text-xs text-white hover:text-accent"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(url)}
                            title="Удалить фото"
                            className="text-xs text-white hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {form.photos.length < MAX_CAR_PHOTOS && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photoUploading}
                        className="flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                      >
                        <span className="text-lg">＋</span>
                        {photoUploading ? "Загружаем…" : "Добавить фото"}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handlePhotoFiles}
                      className="hidden"
                    />
                  </div>
                  {photoError && <p className="mt-1.5 text-xs text-red-400">{photoError}</p>}
                </div>
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
                  {car.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={car.photos[0]}
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
                      {car.photos.length > 0 && (
                        <span className="text-muted">📷 {car.photos.length}</span>
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

      {/* Добавить администратора */}
      {tab === "admins" && (
        <div className="mt-6 max-w-md">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h3 className="font-display font-semibold">Новый администратор</h3>
            <p className="mt-2 text-sm text-muted">
              Создаёт обычный аккаунт с ролью admin — полный доступ к этой панели сразу после
              создания. Раздавайте доступ только людям, которым доверяете.
            </p>
            <form onSubmit={createAdmin} className="mt-5 space-y-3">
              <input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Имя (необязательно)"
                className={inputCls}
              />
              <input
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                type="email"
                placeholder="Email *"
                className={inputCls}
              />
              <input
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                type="password"
                placeholder="Пароль (мин. 8 символов) *"
                className={inputCls}
              />
              {adminError && <p className="text-sm text-red-400">{adminError}</p>}
              {adminSuccess && <p className="text-sm text-emerald-400">{adminSuccess}</p>}
              <button
                type="submit"
                disabled={adminSaving || !adminEmail.trim() || adminPassword.length < 8}
                className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-2 disabled:opacity-60"
              >
                {adminSaving ? "Создаём…" : "Создать администратора"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
