// JSON-LD 結構化資料
import { SITE, WORK_ITEMS } from "../data/site";
import type { Faq, Service } from "../data/services";

const abs = (site: URL, path: string) => new URL(path, site).href;

export function business(site: URL, logo?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": abs(site, "/#business"),
    name: SITE.name,
    description: SITE.description,
    url: abs(site, "/"),
    telephone: SITE.phoneIntl,
    ...(logo ? { image: logo } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: SITE.areaServed.map((name) => ({ "@type": "City", name })),
    sameAs: [SITE.facebook, SITE.line],
    knowsAbout: WORK_ITEMS,
  };
}

export function website(site: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs(site, "/#website"),
    name: SITE.name,
    url: abs(site, "/"),
    inLanguage: "zh-Hant-TW",
    publisher: { "@id": abs(site, "/#business") },
  };
}

export function breadcrumb(site: URL, items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(site, it.href),
    })),
  };
}

export function faqPage(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function service(site: URL, s: Service, image: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.keyword,
    serviceType: s.short,
    description: s.seoDescription,
    url: abs(site, `/services/${s.slug}/`),
    image,
    provider: { "@id": abs(site, "/#business") },
    areaServed: SITE.areaServed.map((name) => ({ "@type": "City", name })),
  };
}

export function article(
  site: URL,
  a: { title: string; description: string; slug: string; published: string; updated: string },
  image: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url: abs(site, `/blog/${a.slug}/`),
    image,
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: "zh-Hant-TW",
    author: { "@id": abs(site, "/#business") },
    publisher: { "@id": abs(site, "/#business") },
    mainEntityOfPage: abs(site, `/blog/${a.slug}/`),
  };
}
