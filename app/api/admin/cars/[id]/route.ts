import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { deleteCar, updateCar } from "@/lib/db";
import { carInputFromBody } from "../../car-input";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ ok: false }, { status: 400 });
  const parsed = carInputFromBody(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  const car = await updateCar(id, parsed.value);
  if (!car) return NextResponse.json({ ok: false, error: "Авто не найдено" }, { status: 404 });
  return NextResponse.json({ ok: true, car });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ ok: false }, { status: 400 });
  await deleteCar(id);
  return NextResponse.json({ ok: true });
}
