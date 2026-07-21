// Клиентская авторизация v1 (localStorage). При подключении БД (Neon Postgres +
// Auth.js) этот модуль заменяется серверным — интерфейс функций сохраняется.

export interface User {
  name: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
}

interface StoredUser extends User {
  passHash: string;
}

const USERS_KEY = "begov_users";
const SESSION_KEY = "begov_session";
export const AUTH_EVENT = "begov-auth";

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function notify() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const stored = readUsers().find((u) => u.email === email);
  if (!stored) return null;
  const { passHash: _passHash, ...user } = stored;
  return user;
}

export async function register(input: {
  name: string;
  email: string;
  phone: string;
  country: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "Пользователь с таким email уже зарегистрирован" };
  }
  users.push({
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    country: input.country,
    createdAt: new Date().toISOString(),
    passHash: await sha256(input.password),
  });
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, email);
  notify();
  return { ok: true };
}

export async function login(
  emailRaw: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === email);
  if (!user || user.passHash !== (await sha256(password))) {
    return { ok: false, error: "Неверный email или пароль" };
  }
  localStorage.setItem(SESSION_KEY, email);
  notify();
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  notify();
}
