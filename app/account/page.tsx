"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { logout } from "@/lib/auth";
import { getLeads, type Lead } from "@/lib/leads";

export default function AccountPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (ready && !user) router.replace("/auth/login");
  }, [ready, user, router]);

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  if (!ready || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Личный кабинет</h1>
          <p className="mt-2 text-sm text-muted">Добро пожаловать, {user.name}!</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-red-400 hover:text-red-400"
        >
          Выйти
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Профиль
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            {[
              ["Имя", user.name],
              ["Email", user.email],
              ["Телефон", user.phone],
              ["Страна", user.country],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Быстрые действия
          </h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {[
              ["/contacts", "Оставить заявку на подбор"],
              ["/calculator", "Рассчитать доставку"],
              ["/vin", "Проверить VIN"],
              ["/catalog", "Смотреть каталог"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface">
        <div className="border-b border-line bg-surface-2 px-6 py-4">
          <h2 className="font-display text-sm font-semibold">Мои заявки</h2>
        </div>
        {leads.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            Заявок пока нет. Оставьте первую —{" "}
            <Link href="/contacts" className="font-semibold text-accent hover:underline">
              подобрать авто
            </Link>
            .
          </div>
        ) : (
          <ul className="divide-y divide-line/60">
            {leads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4">
                <div>
                  <div className="text-sm font-semibold">
                    <span className="mr-2 rounded bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">
                      {lead.type}
                    </span>
                    {lead.summary}
                  </div>
                  {lead.details && <div className="mt-1 text-xs text-muted">{lead.details}</div>}
                </div>
                <time className="text-xs text-muted">
                  {new Date(lead.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Данные кабинета в текущей версии хранятся в вашем браузере. После подключения базы данных
        заявки будут синхронизироваться между устройствами и попадать напрямую к менеджеру.
      </p>
    </div>
  );
}
