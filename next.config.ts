import type { NextConfig } from "next";

// 讀 GEO API 時，圖片從 GEO 的網域取（見 src/lib/image.ts），要列入 next/image 允許的來源
const geo = process.env.NEXT_PUBLIC_GEO_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_GEO_PUBLIC_URL) : null;

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  // 沿用 Astro 版的網址格式（/services/xxx/）
  trailingSlash: true,
  images: {
    remotePatterns: geo
      ? [{ protocol: geo.protocol === "http:" ? "http" : "https", hostname: geo.hostname, port: geo.port, pathname: "/uploads/**" }]
      : [],
  },
};

export default nextConfig;
