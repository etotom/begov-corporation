import { NextResponse } from "next/server";

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i;

// Поля NHTSA vPIC, которые показываем клиенту
const FIELDS: Record<string, string> = {
  Make: "Марка",
  Model: "Модель",
  ModelYear: "Год выпуска",
  Trim: "Комплектация",
  BodyClass: "Тип кузова",
  Doors: "Количество дверей",
  DriveType: "Привод",
  EngineCylinders: "Цилиндры",
  DisplacementL: "Объем двигателя, л",
  EngineHP: "Мощность, л.с.",
  FuelTypePrimary: "Топливо",
  TransmissionStyle: "Коробка передач",
  VehicleType: "Тип ТС",
  PlantCountry: "Страна сборки",
  PlantCity: "Город сборки",
};

export async function GET(request: Request) {
  const vin = new URL(request.url).searchParams.get("vin")?.trim().toUpperCase() ?? "";

  if (!VIN_RE.test(vin)) {
    return NextResponse.json(
      { ok: false, error: "VIN должен состоять из 17 символов (латинские буквы и цифры, без I, O, Q)" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error(`vPIC ${res.status}`);
    const data = await res.json();
    const raw = data?.Results?.[0] ?? {};

    if (!raw.Make && !raw.Model) {
      return NextResponse.json({
        ok: false,
        error:
          "По этому VIN данные не найдены. База NHTSA лучше всего покрывает авто для рынка США и Канады — пришлите VIN менеджеру, проверим вручную.",
      });
    }

    const result = Object.entries(FIELDS)
      .map(([key, label]) => ({ label, value: String(raw[key] ?? "").trim() }))
      .filter((f) => f.value && f.value !== "0");

    return NextResponse.json({ ok: true, vin, result });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Сервис проверки временно недоступен, попробуйте позже" },
      { status: 502 },
    );
  }
}
