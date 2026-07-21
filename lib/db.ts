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
    photoUrl: r.photo_url,
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
}): Promise<DbUser | "exists"> {
  try {
    const rows = await sql`
      INSERT INTO users (name, email, phone, country, pass_hash)
      VALUES (${input.name}, ${input.email.toLowerCase()}, ${input.phone}, ${input.country}, ${input.passHash})
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

export async function createCar(c: CarInput): Promise<Car> {
  const rows = await sql`
    INSERT INTO cars (make, model, year, price, mileage_km, engine, fuel, gearbox, drive, body, color, source, status, photo_url, visible)
    VALUES (${c.make}, ${c.model}, ${c.year}, ${c.price}, ${c.mileageKm}, ${c.engine}, ${c.fuel}, ${c.gearbox}, ${c.drive}, ${c.body}, ${c.color}, ${c.source}, ${c.status}, ${c.photoUrl}, ${c.visible})
    RETURNING *`;
  return rowToCar(rows[0]);
}

export async function updateCar(id: number, c: CarInput): Promise<Car | null> {
  const rows = await sql`
    UPDATE cars SET
      make = ${c.make}, model = ${c.model}, year = ${c.year}, price = ${c.price},
      mileage_km = ${c.mileageKm}, engine = ${c.engine}, fuel = ${c.fuel},
      gearbox = ${c.gearbox}, drive = ${c.drive}, body = ${c.body}, color = ${c.color},
      source = ${c.source}, status = ${c.status}, photo_url = ${c.photoUrl}, visible = ${c.visible}
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
}): Promise<DbLead> {
  const rows = await sql`
    INSERT INTO leads (type, summary, details, name, phone, country)
    VALUES (${input.type}, ${input.summary}, ${input.details ?? ""}, ${input.name ?? ""}, ${input.phone ?? ""}, ${input.country ?? ""})
    RETURNING *`;
  return rowToLead(rows[0]);
}

export async function getLeads(): Promise<DbLead[]> {
  const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
  return rows.map(rowToLead);
}

export async function setLeadStatus(id: number, status: "new" | "done"): Promise<void> {
  await sql`UPDATE leads SET status = ${status} WHERE id = ${id}`;
}

export async function deleteLead(id: number): Promise<void> {
  await sql`DELETE FROM leads WHERE id = ${id}`;
}
