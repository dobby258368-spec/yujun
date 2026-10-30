import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  // 沿用 Astro 版的網址格式（/services/xxx/）
  trailingSlash: true,
};

export default nextConfig;
