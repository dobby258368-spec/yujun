import type { MetadataRoute } from "next";
import { SERVICES } from "@/data/services";
import { CASES } from "@/data/cases";
import { SITE_URL } from "@/lib/seo";
import posts from "@/data/posts.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/about/",
    "/blog/",
    ...posts.map((p) => `/blog/${p.slug}/`),
    "/cases/",
    ...CASES.map((c) => `/cases/${c.slug}/`),
    "/contact/",
    "/faq/",
    "/process/",
    "/services/",
    ...SERVICES.map((s) => `/services/${s.slug}/`),
  ];
  return paths.map((p) => ({ url: new URL(p, SITE_URL).href }));
}
