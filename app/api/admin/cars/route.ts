import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createCar, getAllCars } from "@/lib/db";
import { carInputFromBody } from "../car-input";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, cars: await getAllCars() });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = carInputFromBody(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  const car = await createCar(parsed.value);
  return NextResponse.json({ ok: true, car });
}
