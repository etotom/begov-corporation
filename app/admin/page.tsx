import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getAllCars, getLeads } from "@/lib/db";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Панель управления",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [cars, leads] = await Promise.all([getAllCars(), getLeads()]);
  return <AdminClient initialCars={cars} initialLeads={leads} />;
}
