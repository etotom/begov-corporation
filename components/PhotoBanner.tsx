import Image from "next/image";
import type { ReactNode } from "react";

const OVERLAYS = {
  bottom: "bg-gradient-to-t from-foreground/92 via-foreground/45 to-transparent",
  left: "bg-gradient-to-r from-foreground/92 via-foreground/55 to-foreground/10",
  full: "bg-foreground/60",
} as const;

export default function PhotoBanner({
  src,
  alt,
  overlay = "bottom",
  priority = false,
  className = "",
  children,
}: {
  src: string;
  alt: string;
  overlay?: keyof typeof OVERLAYS;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div className="kenburns absolute inset-0">
        <Image src={src} alt={alt} fill priority={priority} className="object-cover" sizes="100vw" />
      </div>
      <div className={`pointer-events-none absolute inset-0 ${OVERLAYS[overlay]}`} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
