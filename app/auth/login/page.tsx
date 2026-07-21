"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
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
      <h1 className="font-display text-2xl font-bold">Вход</h1>
      <p className="mt-2 text-sm text-muted">Личный кабинет Begov Corporation.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className={inputCls}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Пароль"
          className={inputCls}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-6 py-3.5 font-bold text-background transition-colors hover:bg-accent-2 disabled:opacity-60"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Нет аккаунта?{" "}
        <Link href="/auth/register" className="font-semibold text-accent hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
