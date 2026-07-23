import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CarGallery from "@/components/CarGallery";
import { formatKm, formatPrice } from "@/lib/cars";
import { getCarById } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

async function loadCar(id: string) {
  const numId = Number(id);
  if (!Number.isInteger(numId)) return null;
  const car = await getCarById(numId);
  if (!car || !car.visible) return null;
  return car;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await loadCar(id);
  if (!car) return {};
  const title = `${car.make} ${car.model} ${car.year}`;
  const description = `${title} — ${formatPrice(car.price)}, ${formatKm(car.mileageKm)}. Доставка из ${car.source} через Грузию.`;
  const cover = car.photos[0];
  return {
    title,
    description,
    alternates: { canonical: `/catalog/${car.id}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
  };
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await loadCar(id);
  if (!car) notFound();

  const specs: [string, string][] = [
    ["Год выпуска", String(car.year)],
    ["Пробег", formatKm(car.mileageKm)],
    ["Двигатель", car.engine],
    ["Топливо", car.fuel],
    ["Коробка передач", car.gearbox],
    ["Привод", car.drive],
    ["Кузов", car.body],
    ["Цвет", car.color],
    ["Регион закупки", car.source],
    ["Статус", car.status],
  ];

  const carLabel = `${car.make} ${car.model} ${car.year}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: carLabel,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: String(car.year),
    ...(car.color ? { color: car.color } : {}),
    ...(car.fuel ? { fuelType: car.fuel } : {}),
    ...(car.mileageKm
      ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileageKm, unitCode: "KMT" } }
      : {}),
    ...(car.photos.length ? { image: car.photos } : {}),
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/catalog/${car.id}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/catalog" className="text-sm font-semibold text-accent hover:underline">
        ← Весь каталог
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <CarGallery photos={car.photos} alt={carLabel} />

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              {car.make} {car.model}
            </h1>
            <span className="text-lg text-muted">{car.year}</span>
          </div>

          <div className="mt-4 font-display text-3xl font-bold text-accent">
            {formatPrice(car.price)}
          </div>
          <p className="text-xs text-muted">до Грузии, без доставки в ваш город</p>

          <dl className="mt-6 divide-y divide-line/60 rounded-2xl border border-line bg-surface">
            {specs
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/contacts?car=${encodeURIComponent(carLabel)}`}
              className="rounded-xl bg-accent px-7 py-3.5 font-bold text-white transition-colors hover:bg-accent-2"
            >
              Запросить это авто
            </Link>
            <Link
              href="/calculator"
              className="rounded-xl border border-line px-7 py-3.5 font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Рассчитать доставку
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted">
            Цена ориентировочная и указана за автомобиль с доставкой до Грузии (Поти). Итоговая
            стоимость с доставкой в ваш город и оформлением рассчитывается менеджером.
          </p>
        </div>
      </div>
    </div>
  );
}
