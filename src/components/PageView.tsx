import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockRenderer, { pageFaqs, type BlockContext } from "@/blocks/BlockRenderer";
import Crumbs from "@/components/Crumbs";
import JsonLd from "@/components/JsonLd";
import { STORE_SLUG, getStore, getStorePage, getStorePages, getStorePosts } from "@/lib/content";
import { faqPage, service as serviceLd } from "@/lib/schema";
import { SITE_URL, ogImageUrl, pageMeta } from "@/lib/seo";
import { crumbTrail, pagePath, isCasePage, isServicePage, siteOf } from "@/lib/site";
import type { Page } from "@/content/types";

// 由 Page 資料渲染一整頁：首頁（home）與 [...slug] 共用

const ogImage = (page: Page, fallback: string) =>
  isServicePage(page) ? page.meta.hero : isCasePage(page) ? page.meta.cover : fallback;

export async function pageMetadata(slug: string): Promise<Metadata> {
  const [store, page] = await Promise.all([getStore(STORE_SLUG), getStorePage(STORE_SLUG, slug)]);
  if (!store || !page) return {};
  const site = siteOf(store);
  return pageMeta({
    title: page.seo_title || page.title,
    description: page.seo_description || site.description,
    path: pagePath(page.slug),
    image: ogImage(page, site.defaultImage),
    siteName: site.name,
  });
}


export default async function PageView({ slug }: { slug: string }) {
  const [store, page, pages, posts] = await Promise.all([
    getStore(STORE_SLUG),
    getStorePage(STORE_SLUG, slug),
    getStorePages(STORE_SLUG),
    getStorePosts(STORE_SLUG),
  ]);
  if (!store || !page) notFound();
  const site = siteOf(store);
  const ctx: BlockContext = { site, page, pages, posts };

  const faqs = pageFaqs(ctx);
  const ld = [
    ...(isServicePage(page)
      ? [serviceLd(SITE_URL, site, { name: page.title, type: page.meta.short, description: page.seo_description ?? "", path: pagePath(page.slug) }, ogImageUrl(page.meta.hero))]
      : []),
    ...(faqs.length ? [faqPage(faqs)] : []),
  ];

  return (
    <>
      {ld.length > 0 && <JsonLd data={ld} />}
      {page.slug !== "home" && <Crumbs items={crumbTrail(page, pages)} />}
      <BlockRenderer blocks={page.content} ctx={ctx} />
    </>
  );
}
