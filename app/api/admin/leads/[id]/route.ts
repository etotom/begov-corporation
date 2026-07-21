import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { deleteLead, setLeadStatus } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const id = Number((await params).id);
  const { status } = await request.json().catch(() => ({}));
  if (!Number.isInteger(id) || (status !== "new" && status !== "done")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await setLeadStatus(id, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ ok: false }, { status: 400 });
  await deleteLead(id);
  return NextResponse.json({ ok: true });
}
