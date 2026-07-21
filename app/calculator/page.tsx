import type { Metadata } from "next";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "Калькулятор доставки авто",
  description:
    "Рассчитайте ориентировочную стоимость авто под ключ: аукционные сборы, доставка в Грузию и автовоз до Душанбе, Ташкента, Алматы, Бишкека или Москвы.",
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
