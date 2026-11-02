import type { CaseMeta, Page, ServiceMeta, Store } from "@/content/types";

// 全站共用的品牌資料（NAP）：由 Store 與 template_settings 整理成元件好用的形狀
export type Site = ReturnType<typeof siteOf>;

export function siteOf(store: Store) {
  const t = store.template_settings;
  const address = { ...t.address, full: store.contact_info?.address ?? "" };
  return {
    name: store.name,
    description: store.description ?? "",
    logo: t.logo,
    tagline: t.tagline,
    phone: store.contact_info?.phone ?? "",
    phoneIntl: t.phone_intl,
    address,
    areaServed: t.area_served,
    areaText: t.area_text,
    workItems: t.work_items,
    nav: t.nav,
    line: store.social_links?.line ?? "",
    facebook: store.social_links?.facebook ?? "",
    defaultImage: t.default_image,
    bookingUrl: t.booking_url,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address.full),
    mapEmbed: "https://www.google.com/maps?q=" + encodeURIComponent(address.full) + "&output=embed",
  };
}

export type ServicePage = Page & { meta: ServiceMeta };
export type CasePage = Page & { meta: CaseMeta };

export const isServicePage = (p: Page): p is ServicePage => p.slug.startsWith("services/");
export const isCasePage = (p: Page): p is CasePage => p.slug.startsWith("cases/");

// 網址路徑 ↔ 頁面 slug：/ 對應 home，/services/turnkey/ 對應 services/turnkey
export const pagePath = (slug: string) => (slug === "home" ? "/" : `/${slug}/`);

// 麵包屑：依 slug 逐層找上層頁面的標題，例如 services/turnkey → 服務項目 / 桃園裝潢統包
export function crumbTrail(page: Page, pages: Page[]) {
  const parts = page.slug.split("/");
  return parts.map((_, i) => {
    const slug = parts.slice(0, i + 1).join("/");
    const p = slug === page.slug ? page : pages.find((x) => x.slug === slug);
    return { name: p?.title ?? slug, href: pagePath(slug) };
  });
}

/** 服務頁 slug 去掉 services/，即文章 meta.service 與案例 meta.services 使用的代號 */
export const serviceKey = (p: Page) => p.slug.slice("services/".length);
