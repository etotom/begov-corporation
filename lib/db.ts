import "server-only";
import { neon } from "@neondatabase/serverless";
import type { Car, CarInput } from "@/lib/cars";

const sql = neon(process.env.DATABASE_URL!);

export interface DbUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface DbUserWithHash extends DbUser {
  passHash: string;
}

export interface DbLead {
  id: number;
  type: string;
  summary: string;
  details: string;
  name: string;
  phone: string;
  country: string;
  status: "new" | "done";
  createdAt: string;
  userId: number | null;
  telegramChatId: number | null;
}

export interface TgAdmin {
  chatId: number;
  username: string;
  firstName: string;
  isOwner: boolean;
}

export interface TgSession {
  state: string;
  data: Record<string, unknown>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToCar(r: any): Car {
  return {
    id: r.id,
    make: r.make,
    model: r.model,
    year: r.year,
    price: r.price,
    mileageKm: r.mileage_km,
    engine: r.engine,
    fuel: r.fuel,
    gearbox: r.gearbox,
    drive: r.drive,
    body: r.body,
    color: r.color,
    source: r.source,
    status: r.status,
    photos: r.photos ?? [],
    listingUrl: r.listing_url,
    visible: r.visible,
  };
}

function rowToLead(r: any): DbLead {
  return {
    id: r.id,
    type: r.type,
    summary: r.summary,
    details: r.details ?? "",
    name: r.name ?? "",
    phone: r.phone ?? "",
    country: r.country ?? "",
    status: r.status,
    createdAt: r.created_at,
    userId: r.user_id ?? null,
    telegramChatId: r.telegram_chat_id != null ? Number(r.telegram_chat_id) : null,
  };
}
function rowToUser(r: any): DbUserWithHash {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? "",
    country: r.country ?? "",
    role: r.role === "admin" ? "admin" : "user",
    createdAt: r.created_at,
    passHash: r.pass_hash,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- Пользователи ---

function stripHash(u: DbUserWithHash): DbUser {
  const { passHash: _passHash, ...user } = u;
  return user;
}

export async function getUserByEmail(email: string): Promise<DbUserWithHash | null> {
  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function getUserById(id: number): Promise<DbUser | null> {
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] ? stripHash(rowToUser(rows[0])) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  phone: string;
  country: string;
  passHash: string;
  role?: "user" | "admin";
  authProvider?: string;
}): Promise<DbUser | "exists"> {
  try {
    const rows = await sql`
      INSERT INTO users (name, email, phone, country, pass_hash, role, auth_provider)
      VALUES (${input.name}, ${input.email.toLowerCase()}, ${input.phone}, ${input.country}, ${input.passHash}, ${input.role ?? "user"}, ${input.authProvider ?? "password"})
      RETURNING *`;
    return stripHash(rowToUser(rows[0]));
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "23505") return "exists";
    throw e;
  }
}

// --- Каталог ---

export async function getVisibleCars(): Promise<Car[]> {
  const rows = await sql`SELECT * FROM cars WHERE visible = true ORDER BY created_at DESC`;
  return rows.map(rowToCar);
}

export async function getAllCars(): Promise<Car[]> {
  const rows = await sql`SELECT * FROM cars ORDER BY created_at DESC`;
  return rows.map(rowToCar);
}

export async function getCarById(id: number): Promise<Car | null> {
  const rows = await sql`SELECT * FROM cars WHERE id = ${id}`;
  return rows[0] ? rowToCar(rows[0]) : null;
}

export async function createCar(c: CarInput): Promise<Car> {
  const rows = await sql`
    INSERT INTO cars (make, model, year, price, mileage_km, engine, fuel, gearbox, drive, body, color, source, status, photos, listing_url, visible)
    VALUES (${c.make}, ${c.model}, ${c.year}, ${c.price}, ${c.mileageKm}, ${c.engine}, ${c.fuel}, ${c.gearbox}, ${c.drive}, ${c.body}, ${c.color}, ${c.source}, ${c.status}, ${c.photos}, ${c.listingUrl}, ${c.visible})
    RETURNING *`;
  return rowToCar(rows[0]);
}

export async function updateCar(id: number, c: CarInput): Promise<Car | null> {
  const rows = await sql`
    UPDATE cars SET
      make = ${c.make}, model = ${c.model}, year = ${c.year}, price = ${c.price},
      mileage_km = ${c.mileageKm}, engine = ${c.engine}, fuel = ${c.fuel},
      gearbox = ${c.gearbox}, drive = ${c.drive}, body = ${c.body}, color = ${c.color},
      source = ${c.source}, status = ${c.status}, photos = ${c.photos},
      listing_url = ${c.listingUrl}, visible = ${c.visible}
    WHERE id = ${id}
    RETURNING *`;
  return rows[0] ? rowToCar(rows[0]) : null;
}

export async function deleteCar(id: number): Promise<void> {
  await sql`DELETE FROM cars WHERE id = ${id}`;
}

// --- Заявки ---

export async function createLead(input: {
  type: string;
  summary: string;
  details?: string;
  name?: string;
  phone?: string;
  country?: string;
  userId?: number | null;
  telegramChatId?: number | null;
}): Promise<DbLead> {
  const rows = await sql`
    INSERT INTO leads (type, summary, details, name, phone, country, user_id, telegram_chat_id)
    VALUES (${input.type}, ${input.summary}, ${input.details ?? ""}, ${input.name ?? ""}, ${input.phone ?? ""}, ${input.country ?? ""}, ${input.userId ?? null}, ${input.telegramChatId ?? null})
    RETURNING *`;
  return rowToLead(rows[0]);
}

export async function getLeads(): Promise<DbLead[]> {
  const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
  return rows.map(rowToLead);
}

export async function getLeadById(id: number): Promise<DbLead | null> {
  const rows = await sql`SELECT * FROM leads WHERE id = ${id}`;
  return rows[0] ? rowToLead(rows[0]) : null;
}

export async function getLeadsByUser(userId: number): Promise<DbLead[]> {
  const rows = await sql`SELECT * FROM leads WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows.map(rowToLead);
}

export async function setLeadStatus(id: number, status: "new" | "done"): Promise<void> {
  await sql`UPDATE leads SET status = ${status} WHERE id = ${id}`;
}

export async function deleteLead(id: number): Promise<void> {
  await sql`DELETE FROM leads WHERE id = ${id}`;
}

export async function getLeadStats(): Promise<{ total: number; new: number; done: number; cars: number }> {
  const rows = await sql`
    SELECT
      (SELECT COUNT(*) FROM leads)::int AS total,
      (SELECT COUNT(*) FROM leads WHERE status = 'new')::int AS new,
      (SELECT COUNT(*) FROM leads WHERE status = 'done')::int AS done,
      (SELECT COUNT(*) FROM cars WHERE visible = true)::int AS cars`;
  const r = rows[0];
  return { total: r.total, new: r.new, done: r.done, cars: r.cars };
}

// --- Telegram: администраторы бота ---

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToTgAdmin(r: any): TgAdmin {
  return {
    chatId: Number(r.chat_id),
    username: r.username ?? "",
    firstName: r.first_name ?? "",
    isOwner: !!r.is_owner,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getTelegramAdmins(): Promise<TgAdmin[]> {
  const rows = await sql`SELECT * FROM telegram_admins ORDER BY is_owner DESC, added_at`;
  return rows.map(rowToTgAdmin);
}

export async function isTelegramAdmin(chatId: number): Promise<boolean> {
  const rows = await sql`SELECT 1 FROM telegram_admins WHERE chat_id = ${chatId}`;
  return rows.length > 0;
}

export async function addTelegramAdmin(a: {
  chatId: number;
  username?: string;
  firstName?: string;
  isOwner?: boolean;
}): Promise<void> {
  await sql`
    INSERT INTO telegram_admins (chat_id, username, first_name, is_owner)
    VALUES (${a.chatId}, ${a.username ?? ""}, ${a.firstName ?? ""}, ${a.isOwner ?? false})
    ON CONFLICT (chat_id) DO UPDATE SET
      username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      is_owner = telegram_admins.is_owner OR EXCLUDED.is_owner`;
}

export async function removeTelegramAdmin(chatId: number): Promise<boolean> {
  const rows = await sql`DELETE FROM telegram_admins WHERE chat_id = ${chatId} AND is_owner = false RETURNING chat_id`;
  return rows.length > 0;
}

// --- Telegram: состояние диалога (многошаговые сценарии) ---

export async function getTgSession(chatId: number): Promise<TgSession> {
  const rows = await sql`SELECT state, data FROM telegram_sessions WHERE chat_id = ${chatId}`;
  return rows[0] ? { state: rows[0].state, data: rows[0].data ?? {} } : { state: "", data: {} };
}

export async function setTgSession(
  chatId: number,
  state: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  await sql`
    INSERT INTO telegram_sessions (chat_id, state, data, updated_at)
    VALUES (${chatId}, ${state}, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (chat_id) DO UPDATE SET state = EXCLUDED.state, data = EXCLUDED.data, updated_at = now()`;
}

export async function clearTgSession(chatId: number): Promise<void> {
  await sql`DELETE FROM telegram_sessions WHERE chat_id = ${chatId}`;
}
