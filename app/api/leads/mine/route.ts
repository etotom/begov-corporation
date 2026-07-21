import { NextResponse } from "next/server";
import { getLeadsByUser } from "@/lib/db";
import { getSessionUser } from "@/lib/server-auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const leads = await getLeadsByUser(user.id);
  return NextResponse.json({ ok: true, leads });
}
