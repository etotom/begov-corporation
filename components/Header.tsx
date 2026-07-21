"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/vin", label: "VIN-проверка" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/services", label: "Услуги" },
  { href: "/about", label: "О компании" },
  { href: "/contacts", label: "Контакты" },
];

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname.startsWith(item.href) ? "text-accent" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-accent-2"
            >
              Admin
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              className="rounded-lg border border-accent/50 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
            >
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted transition-colors hover:text-accent"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-accent-2"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-line p-2 text-foreground lg:hidden"
          aria-label="Меню"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-surface px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname.startsWith(item.href)
                    ? "bg-accent/10 text-accent"
                    : "text-foreground hover:bg-surface-2"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-3 border-t border-line pt-4">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-bold text-background"
                >
                  Admin
                </Link>
              )}
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-accent/50 px-4 py-2.5 text-center text-sm font-semibold text-accent"
                >
                  Личный кабинет
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg border border-line px-4 py-2.5 text-center text-sm font-medium"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-bold text-background"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
