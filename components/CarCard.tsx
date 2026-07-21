import Link from "next/link";
import { formatKm, formatPrice, type Car } from "@/lib/cars";

function Silhouette({ body }: { body: Car["body"] }) {
  if (body === "Седан") {
    return (
      <svg viewBox="0 0 320 120" className="h-full w-full" aria-hidden="true">
        <path
          d="M18 88 C30 84 44 82 58 80 C74 62 96 50 126 48 C168 46 202 54 224 68 C252 70 280 76 296 84 C302 87 304 92 302 96 H286 A18 18 0 0 0 250 96 H112 A18 18 0 0 0 76 96 H22 C16 96 14 90 18 88 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M96 68 C110 56 132 52 152 52 L158 68 Z M168 52 C190 53 208 58 220 68 L166 68 Z"
          fill="#0a0e15"
          opacity="0.55"
        />
        <circle cx="94" cy="96" r="13" fill="#0a0e15" stroke="currentColor" strokeWidth="4" />
        <circle cx="268" cy="96" r="13" fill="#0a0e15" stroke="currentColor" strokeWidth="4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 120" className="h-full w-full" aria-hidden="true">
      <path
        d="M20 86 C28 82 40 80 52 78 C62 54 84 40 118 38 C160 36 196 44 218 60 C248 62 276 70 294 80 C300 83 302 90 300 94 H284 A19 19 0 0 0 246 94 H114 A19 19 0 0 0 76 94 H24 C17 94 15 89 20 86 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M92 60 C104 46 126 42 148 42 L154 60 Z M164 42 C188 44 204 50 216 60 L162 60 Z"
        fill="#0a0e15"
        opacity="0.55"
      />
      <circle cx="95" cy="94" r="14" fill="#0a0e15" stroke="currentColor" strokeWidth="4" />
      <circle cx="265" cy="94" r="14" fill="#0a0e15" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

const STATUS_STYLE: Record<Car["status"], string> = {
  "В наличии в Грузии": "bg-emerald-500/15 text-emerald-400",
  "В пути": "bg-sky-500/15 text-sky-400",
  "Под заказ": "bg-violet-500/15 text-violet-400",
};

export default function CarCard({ car }: { car: Car }) {
  const cover = car.photos[0];
  return (
    <article className="card-glow flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow">
      <Link href={`/catalog/${car.id}`} className="contents">
        <div className="relative bg-gradient-to-br from-surface-2 to-background">
          <div className="absolute left-4 top-4 z-10 flex gap-2">
            <span className="rounded-md bg-accent/15 px-2 py-1 text-[11px] font-bold text-accent backdrop-blur-sm">
              {car.source}
            </span>
            <span
              className={`rounded-md px-2 py-1 text-[11px] font-bold backdrop-blur-sm ${STATUS_STYLE[car.status]}`}
            >
              {car.status}
            </span>
            {car.photos.length > 1 && (
              <span className="rounded-md bg-foreground/70 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                📷 {car.photos.length}
              </span>
            )}
          </div>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={`${car.make} ${car.model} ${car.year}`}
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="p-6">
              <div className="mt-6 h-28 text-accent/80">
                <Silhouette body={car.body} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-[15px] font-semibold">
              {car.make} {car.model}
            </h3>
            <span className="text-sm text-muted">{car.year}</span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
            {[
              ["Пробег", formatKm(car.mileageKm)],
              ["Двигатель", car.engine],
              ["Топливо", car.fuel],
              ["Привод", car.drive],
              ["КПП", car.gearbox],
              ["Цвет", car.color],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-line/60 pb-1.5">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-5 pb-5">
        <div>
          <div className="font-display text-lg font-bold text-accent">{formatPrice(car.price)}</div>
          <div className="text-[11px] text-muted">до Грузии, без доставки в ваш город</div>
        </div>
        <Link
          href={`/contacts?car=${encodeURIComponent(`${car.make} ${car.model} ${car.year}`)}`}
          className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-accent-2"
        >
          Запросить
        </Link>
      </div>
    </article>
  );
}
