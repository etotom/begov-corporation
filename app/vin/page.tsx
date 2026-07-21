import type { Metadata } from "next";
import VinClient from "./VinClient";

export const metadata: Metadata = {
  title: "Проверка авто по VIN — бесплатно",
  description:
    "Бесплатная расшифровка VIN-кода: марка, модель, год, двигатель, комплектация, страна сборки. Проверьте автомобиль перед покупкой с аукциона США.",
};

export default function VinPage() {
  return <VinClient />;
}
