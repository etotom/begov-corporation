import type { Metadata } from "next";
import { getVisibleCars } from "@/lib/db";
import CatalogClient from "./CatalogClient";

export const metadata: Metadata = {
  title: "Каталог автомобилей",
  description:
    "Автомобили из США, Европы и ОАЭ: в наличии на стоянке в Грузии, в пути и под заказ. Доставка в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию.",
};

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const cars = await getVisibleCars();
  return <CatalogClient cars={cars} />;
}
