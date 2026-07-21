"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Неверный пароль");
      }
    } catch {
      setError("Ошибка соединения, попробуйте еще раз");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-20">
      <LogoMark className="h-16 w-16" />
      <h1 className="font-display mt-6 text-2xl font-bold">Панель управления</h1>
      <p className="mt-2 text-sm text-muted">Доступ только для сотрудников</p>

      <form onSubmit={submit} className="mt-8 w-full space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль администратора"
          autoFocus
          className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-sm outline-none transition-colors focus:border-accent"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-accent px-6 py-3.5 font-bold text-background transition-colors hover:bg-accent-2 disabled:opacity-60"
        >
          {loading ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
