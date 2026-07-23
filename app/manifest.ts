import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Auto Export`,
    short_name: "Begov",
    description:
      "Подбор и доставка автомобилей с аукционов США, Европы и ОАЭ через Грузию в Центральную Азию и Россию.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1320",
    theme_color: "#0d1320",
    lang: "ru",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
