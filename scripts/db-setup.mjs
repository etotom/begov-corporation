// Создание таблиц, стартовое наполнение каталога и учетка админа.
// Запуск: npm run db:setup (использует .env.local)
// Админ: берется из ADMIN_EMAIL + ADMIN_PASSWORD; повторный запуск обновляет
// пароль админа из env (env — источник истины).
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL не найден. Запустите: vercel env pull .env.local");
  process.exit(1);
}
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    price INT NOT NULL,
    mileage_km INT NOT NULL DEFAULT 0,
    engine TEXT NOT NULL DEFAULT '',
    fuel TEXT NOT NULL DEFAULT 'Бензин',
    gearbox TEXT NOT NULL DEFAULT 'Автомат',
    drive TEXT NOT NULL DEFAULT 'Передний',
    body TEXT NOT NULL DEFAULT 'Седан',
    color TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'США',
    status TEXT NOT NULL DEFAULT 'Под заказ',
    photo_url TEXT,
    photos TEXT[] NOT NULL DEFAULT '{}',
    listing_url TEXT,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

await sql`ALTER TABLE cars ADD COLUMN IF NOT EXISTS listing_url TEXT`;
await sql`ALTER TABLE cars ADD COLUMN IF NOT EXISTS photos TEXT[] NOT NULL DEFAULT '{}'`;
await sql`
  UPDATE cars SET photos = ARRAY[photo_url]
  WHERE photo_url IS NOT NULL AND photo_url <> '' AND array_length(photos, 1) IS NULL`;

await sql`
  CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    summary TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    pass_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    auth_provider TEXT NOT NULL DEFAULT 'password',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'password'`;

// Формат хэша совпадает с lib/server-auth.ts
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, Buffer.from(salt, "hex"), 64).toString("hex");
  return `s2:${salt}:${hash}`;
}

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  await sql`
    INSERT INTO users (name, email, pass_hash, role)
    VALUES ('Администратор', ${adminEmail}, ${hashPassword(adminPassword)}, 'admin')
    ON CONFLICT (email)
    DO UPDATE SET role = 'admin', pass_hash = EXCLUDED.pass_hash`;
  console.log(`Админ настроен: ${adminEmail}`);
} else {
  console.log("ADMIN_EMAIL/ADMIN_PASSWORD не заданы — админ не создан");
}

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM cars`;
if (count === 0) {
  const seed = [
    ["Toyota", "Camry SE", 2021, 17900, 45000, "2.5 л", "Бензин", "Автомат", "Передний", "Седан", "Белый", "США", "В наличии в Грузии"],
    ["Hyundai", "Sonata", 2021, 15800, 38000, "2.5 л", "Бензин", "Автомат", "Передний", "Седан", "Серый", "США", "В наличии в Грузии"],
    ["Kia", "K5 GT-Line", 2022, 16900, 29000, "1.6 л Turbo", "Бензин", "Автомат", "Передний", "Седан", "Черный", "США", "В пути"],
    ["Toyota", "RAV4 XLE", 2021, 21500, 42000, "2.5 л", "Бензин", "Автомат", "Полный", "Кроссовер", "Синий", "США", "В наличии в Грузии"],
    ["Honda", "CR-V EX", 2020, 18400, 55000, "1.5 л Turbo", "Бензин", "Автомат", "Полный", "Кроссовер", "Серебристый", "США", "В пути"],
    ["Hyundai", "Tucson", 2022, 19700, 31000, "2.5 л", "Бензин", "Автомат", "Полный", "Кроссовер", "Зеленый", "США", "Под заказ"],
    ["Chevrolet", "Malibu", 2020, 12900, 60000, "1.5 л Turbo", "Бензин", "Автомат", "Передний", "Седан", "Красный", "США", "В наличии в Грузии"],
    ["Kia", "Sportage", 2022, 19900, 27000, "2.0 л", "Бензин", "Автомат", "Полный", "Кроссовер", "Белый", "США", "В пути"],
    ["Mercedes-Benz", "E 200", 2019, 27500, 78000, "2.0 л Turbo", "Бензин", "Автомат", "Задний", "Седан", "Черный", "Европа", "В наличии в Грузии"],
    ["BMW", "520d", 2020, 28900, 69000, "2.0 л", "Дизель", "Автомат", "Задний", "Седан", "Серый", "Европа", "Под заказ"],
    ["Toyota", "Land Cruiser Prado", 2021, 33900, 52000, "2.7 л", "Бензин", "Автомат", "Полный", "Внедорожник", "Белый", "ОАЭ", "В наличии в Грузии"],
    ["Lexus", "RX 350", 2021, 36500, 44000, "3.5 л", "Бензин", "Автомат", "Полный", "Кроссовер", "Черный", "ОАЭ", "В пути"],
  ];
  for (const [make, model, year, price, km, engine, fuel, gearbox, drive, body, color, source, status] of seed) {
    await sql`INSERT INTO cars (make, model, year, price, mileage_km, engine, fuel, gearbox, drive, body, color, source, status)
      VALUES (${make}, ${model}, ${year}, ${price}, ${km}, ${engine}, ${fuel}, ${gearbox}, ${drive}, ${body}, ${color}, ${source}, ${status})`;
  }
  console.log(`Каталог наполнен: ${seed.length} авто`);
} else {
  console.log(`Каталог уже содержит ${count} авто — сид пропущен`);
}

console.log("Схема БД готова ✔");
