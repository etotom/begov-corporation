import type { Metadata } from "next";
import { Suspense } from "react";
import ContactsClient from "./ContactsClient";

export const metadata: Metadata = {
  title: "Контакты и заявка",
  description:
    "Свяжитесь с Begov Corporation: заявка на подбор авто из США, Европы и ОАЭ с доставкой в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию.",
};

export default function ContactsPage() {
  return (
    <Suspense>
      <ContactsClient />
    </Suspense>
  );
}
