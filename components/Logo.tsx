import Link from "next/link";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bc-gold" x1="12" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f7c948" />
          <stop offset="1" stopColor="#c9820e" />
        </linearGradient>
      </defs>
      <path
        d="M32 2.5 L60 18 V46 L32 61.5 L4 46 V18 Z"
        fill="#0d1320"
        stroke="url(#bc-gold)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M32 8.2 L54.8 20.9 V43.1 L32 55.8 L9.2 43.1 V20.9 Z"
        fill="none"
        stroke="url(#bc-gold)"
        strokeWidth="0.9"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        fillRule="evenodd"
        d="M24 19 H35 C41.5 19 45.2 21.9 45.2 26.6 C45.2 29.7 43.6 31.9 41 32.9 C44.3 33.9 46.3 36.5 46.3 40 C46.3 45.1 42.2 48 35.8 48 H24 Z M29.5 24 V30.5 H35 C37.8 30.5 39.4 29.3 39.4 27.2 C39.4 25.2 37.8 24 35 24 Z M29.5 35.5 V43 H35.6 C38.6 43 40.4 41.6 40.4 39.2 C40.4 36.8 38.6 35.5 35.6 35.5 Z"
        fill="url(#bc-gold)"
      />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="leading-none">
        <span className="font-display block text-[17px] font-bold tracking-[0.12em] text-foreground">
          BEGOV
        </span>
        <span className="mt-1 block text-[9px] font-semibold tracking-[0.28em] text-accent uppercase">
          Corporation · Auto Export
        </span>
      </span>
    </Link>
  );
}
