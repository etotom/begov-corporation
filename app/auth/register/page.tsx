"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/auth";

const COUNTRIES = ["Таджикистан", "Узбекистан", "Казахстан", "Кыргызстан", "Россия", "Грузия", "Другая страна"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: COUNTRIES[0],
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Заполните имя, email и телефон.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Проверьте формат email.");
      return;
    }
    if (form.password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Пароли не совпадают.");
      return;
    }
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.ok) {
      router.push("/account");
    } else {
      setError(res.error);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent";

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="font-display text-2xl font-bold">Регистрация</h1>
      <p className="mt-2 text-sm text-muted">
        Личный кабинет хранит ваши заявки и расчеты — менеджеру не придется ничего переспрашивать.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <input value={form.name} onChange={set("name")} placeholder="Имя и фамилия *" className={inputCls} />
        <input value={form.email} onChange={set("email")} type="email" placeholder="Email *" className={inputCls} />
        <input value={form.phone} onChange={set("phone")} placeholder="Телефон (WhatsApp / Telegram) *" className={inputCls} />
        <select value={form.country} onChange={set("country")} className={inputCls}>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input value={form.password} onChange={set("password")} type="password" placeholder="Пароль (мин. 6 символов) *" className={inputCls} />
        <input value={form.password2} onChange={set("password2")} type="password" placeholder="Повторите пароль *" className={inputCls} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-6 py-3.5 font-bold text-background transition-colors hover:bg-accent-2 disabled:opacity-60"
        >
          {loading ? "Создаем…" : "Создать аккаунт"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/auth/login" className="font-semibold text-accent hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
