import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getLeads } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, leads: await getLeads() });
}
