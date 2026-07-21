export default function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 960 340"
      className={className}
      role="img"
      aria-label="Автовоз Begov Corporation везёт автомобиль с номером BEGOV"
    >
      <defs>
        <linearGradient id="hero-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7c948" />
          <stop offset="1" stopColor="#c9820e" />
        </linearGradient>
        <linearGradient id="hero-gold-soft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7c948" stopOpacity="0.9" />
          <stop offset="1" stopColor="#c9820e" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f7c948" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f7c948" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* фоновое свечение фар */}
      <circle className="hero-glow" cx="905" cy="222" r="70" fill="url(#hero-glow)" />

      {/* линии скорости позади автовоза */}
      <g className="hero-speedline" stroke="url(#hero-gold-soft)" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: "0s" }}>
        <line x1="70" y1="150" x2="115" y2="150" />
      </g>
      <g className="hero-speedline" stroke="url(#hero-gold-soft)" strokeWidth="5" strokeLinecap="round" style={{ animationDelay: "0.35s" }}>
        <line x1="40" y1="192" x2="110" y2="192" />
      </g>
      <g className="hero-speedline" stroke="url(#hero-gold-soft)" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: "0.7s" }}>
        <line x1="65" y1="234" x2="112" y2="234" />
      </g>

      {/* дорога */}
      <line x1="0" y1="300" x2="960" y2="300" stroke="var(--line)" strokeWidth="2" />
      <line
        className="hero-road"
        x1="0"
        y1="300"
        x2="960"
        y2="300"
        stroke="url(#hero-gold)"
        strokeWidth="3"
        strokeDasharray="26 22"
      />

      {/* автовоз */}
      <g className="hero-rig">
        {/* платформа прицепа */}
        <rect x="120" y="182" width="660" height="22" rx="4" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
        <rect x="120" y="200" width="660" height="8" fill="var(--surface)" />

        {/* сцепка */}
        <rect x="700" y="196" width="70" height="10" fill="var(--line)" />

        {/* кабина тягача */}
        <path
          d="M760 260 V182 H842 L900 210 V260 Z"
          fill="var(--surface-2)"
          stroke="url(#hero-gold)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M846 190 L888 212 H846 Z" fill="var(--background)" stroke="url(#hero-gold)" strokeWidth="1.4" opacity="0.9" />
        <rect x="760" y="182" width="16" height="78" fill="var(--surface)" />

        {/* фара */}
        <circle className="hero-headlight" cx="900" cy="230" r="7" fill="url(#hero-gold)" />

        {/* бампер */}
        <rect x="892" y="248" width="14" height="10" rx="2" fill="var(--line)" />

        {/* машина на платформе */}
        <g>
          <path
            d="M190 182 V158 C190 148 198 140 210 138 L250 122 C258 116 268 113 278 113 H460 C472 113 482 118 489 127 L500 138 H620 C632 138 640 148 640 158 V182 Z"
            fill="var(--surface-2)"
            stroke="url(#hero-gold)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M262 135 L286 121 C292 118 299 116 306 116 H420 C428 116 435 119 440 125 L452 137 Z"
            fill="var(--background)"
            stroke="url(#hero-gold)"
            strokeWidth="1.4"
            opacity="0.85"
          />
          <line x1="356" y1="116" x2="356" y2="137" stroke="url(#hero-gold)" strokeWidth="1.2" opacity="0.7" />

          {/* номерной знак */}
          <g>
            <rect x="205" y="162" width="92" height="24" rx="3" fill="#eef2f7" stroke="url(#hero-gold)" strokeWidth="2" />
            <text
              x="251"
              y="179"
              textAnchor="middle"
              fontFamily="var(--font-display), sans-serif"
              fontWeight="700"
              fontSize="14"
              letterSpacing="1.5"
              fill="#0d1320"
            >
              BEGOV
            </text>
          </g>
        </g>

        {/* колёса */}
        <g className="hero-wheel" style={{ transformOrigin: "830px 262px" }}>
          <circle cx="830" cy="262" r="26" fill="var(--background)" stroke="url(#hero-gold)" strokeWidth="3" />
          <circle cx="830" cy="262" r="8" fill="url(#hero-gold)" />
          <line x1="830" y1="240" x2="830" y2="284" stroke="url(#hero-gold)" strokeWidth="2" opacity="0.6" />
          <line x1="808" y1="262" x2="852" y2="262" stroke="url(#hero-gold)" strokeWidth="2" opacity="0.6" />
        </g>
        <g className="hero-wheel" style={{ transformOrigin: "300px 262px", animationDelay: "-0.15s" }}>
          <circle cx="300" cy="262" r="24" fill="var(--background)" stroke="url(#hero-gold)" strokeWidth="3" />
          <circle cx="300" cy="262" r="7" fill="url(#hero-gold)" />
          <line x1="300" y1="241" x2="300" y2="283" stroke="url(#hero-gold)" strokeWidth="2" opacity="0.6" />
          <line x1="279" y1="262" x2="321" y2="262" stroke="url(#hero-gold)" strokeWidth="2" opacity="0.6" />
        </g>
        <g className="hero-wheel" style={{ transformOrigin: "360px 262px", animationDelay: "-0.3s" }}>
          <circle cx="360" cy="262" r="24" fill="var(--background)" stroke="url(#hero-gold)" strokeWidth="3" />
          <circle cx="360" cy="262" r="7" fill="url(#hero-gold)" />
          <line x1="360" y1="241" x2="360" y2="283" stroke="url(#hero-gold)" strokeWidth="2" opacity="0.6" />
          <line x1="339" y1="262" x2="381" y2="262" stroke="url(#hero-gold)" strokeWidth="2" opacity="0.6" />
        </g>
      </g>
    </svg>
  );
}
