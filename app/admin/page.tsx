import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server-auth";
import { getAllCars, getLeads } from "@/lib/db";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Панель управления",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Не-админам страница неотличима от несуществующей: молча уводим на главную
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/");
  const [cars, leads] = await Promise.all([getAllCars(), getLeads()]);
  return <AdminClient initialCars={cars} initialLeads={leads} />;
}
