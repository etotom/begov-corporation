"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/hero/carrier-road.jpg", alt: "Автовоз Begov Corporation везёт автомобили по трассе" },
  { src: "/hero/carrier-front.jpg", alt: "Тягач Scania с брендингом Begov Corporation" },
  { src: "/hero/carrier-highway.jpg", alt: "Автовоз Begov Corporation в пути по автомагистрали" },
];

export default function PhotoHero({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-line shadow-xl ${className}`}>
      {SLIDES.map((s, i) => (
        <div key={s.src} className={`hero-slide ${i === active ? "hero-slide-active" : ""}`}>
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="(min-width: 1024px) 640px, 100vw"
          />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((s, i) => (
          <span
            key={s.src}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-accent" : "w-1.5 bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
