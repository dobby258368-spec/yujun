import type { MetadataRoute } from "next";
import { STORE_SLUG, getStorePages, getStorePosts, pagePath, skipPrerenderInApiBuild } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await skipPrerenderInApiBuild();
  const [pages, posts] = await Promise.all([getStorePages(STORE_SLUG), getStorePosts(STORE_SLUG)]);
  const paths = [...pages.map((p) => pagePath(p.slug)), ...posts.map((p) => `/blog/${p.slug}/`)];
  return paths.map((p) => ({ url: new URL(p, SITE_URL).href }));
}
