import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getUserById, type DbUser } from "@/lib/db";

export const SESSION_COOKIE = "begov_auth";
const SESSION_DAYS = 30;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

// Пароли: scrypt с солью, формат "s2:<salt>:<hash>" (тот же — в scripts/db-setup.mjs)
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, Buffer.from(salt, "hex"), 64).toString("hex");
  return `s2:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [v, salt, hash] = stored.split(":");
  if (v !== "s2" || !salt || !hash) return false;
  try {
    const calc = scryptSync(password, Buffer.from(salt, "hex"), 64);
    const expected = Buffer.from(hash, "hex");
    return calc.length === expected.length && timingSafeEqual(calc, expected);
  } catch {
    return false;
  }
}

// Сессия: "<userId>.<expiresMs>.<hmac>" — stateless, подпись AUTH_SECRET
function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeSession(userId: number): string {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

function parseSession(token: string | undefined): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [idStr, expStr, sig] = parts;
  const expected = sign(`${idStr}.${expStr}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const expires = Number(expStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getSessionUser(): Promise<DbUser | null> {
  const store = await cookies();
  const id = parseSession(store.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return getUserById(id);
}
