import type { Metadata } from "next";
import "@/styles/global.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { business, website } from "@/lib/schema";
import { DEFAULT_IMAGE, SITE_URL, ogImageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <head>
        <link rel="sitemap" href="/sitemap.xml" />
      </head>
      <body>
        <JsonLd data={[business(SITE_URL, ogImageUrl(DEFAULT_IMAGE)), website(SITE_URL)]} />
        <a className="skip" href="#main">跳到主要內容</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
