import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // /hero/*.jpg используют ?v= для сброса кэша при замене фото (lib/asset-version.ts)
    localPatterns: [{ pathname: "/hero/**" }],
  },
};

export default nextConfig;
