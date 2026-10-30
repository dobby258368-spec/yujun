import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// 正式網域確定後，建置時帶入：SITE_URL=https://你的網域 npm run build
// canonical、sitemap、OG、JSON-LD 的網址都從這裡產生
const SITE_URL = process.env.SITE_URL || "https://example.com";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  integrations: [sitemap()],
});
