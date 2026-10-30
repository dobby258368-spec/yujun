import type { Metadata } from "next";
import "@/styles/global.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { STORE_SLUG, getStore, getStorePages } from "@/lib/content";
import { business, website } from "@/lib/schema";
import { SITE_URL, ogImageUrl } from "@/lib/seo";
import { isServicePage, siteOf } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [store, pages] = await Promise.all([getStore(STORE_SLUG), getStorePages(STORE_SLUG)]);
  if (!store) throw new Error(`找不到品牌資料：${STORE_SLUG}`);
  const site = siteOf(store);

  return (
    <html lang="zh-Hant-TW">
      <head>
        <link rel="sitemap" href="/sitemap.xml" />
      </head>
      <body>
        <JsonLd data={[business(SITE_URL, site, ogImageUrl(site.defaultImage)), website(SITE_URL, site)]} />
        <a className="skip" href="#main">跳到主要內容</a>
        <SiteHeader site={site} />
        <main id="main">{children}</main>
        <SiteFooter site={site} services={pages.filter(isServicePage)} />
      </body>
    </html>
  );
}
