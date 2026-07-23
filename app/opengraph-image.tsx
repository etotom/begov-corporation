import { ImageResponse } from "next/og";

export const alt = "Begov Corporation — Auto Export";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Брендовое превью для репостов в WhatsApp/Telegram/соцсети.
// Текст латиницей — рендерится дефолтным шрифтом без подгрузки кириллицы.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0d1320 0%, #141d2e 55%, #0a0e15 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 84,
              height: 84,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              border: "3px solid #e8a930",
              color: "#e8a930",
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 4 }}>BEGOV</div>
            <div style={{ fontSize: 20, color: "#e8a930", letterSpacing: 6 }}>
              CORPORATION · AUTO EXPORT
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            Cars from USA, Europe & UAE
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#e8a930" }}>
            turnkey delivery to your city
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 24, color: "#c7d0dd" }}>
          <span>USA · Europe · UAE</span>
          <span style={{ color: "#e8a930" }}>→</span>
          <span>Tajikistan · Uzbekistan · Kazakhstan · Kyrgyzstan · Russia</span>
        </div>
      </div>
    ),
    size,
  );
}
