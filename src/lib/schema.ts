// JSON-LD 結構化資料
import type { Faq } from "@/blocks/types";
import type { Site } from "@/lib/site";

const abs = (site: URL, path: string) => new URL(path, site).href;

export function business(site: URL, s: Site, logo?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": abs(site, "/#business"),
    name: s.name,
    description: s.description,
    url: abs(site, "/"),
    telephone: s.phoneIntl,
    ...(logo ? { image: logo } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address.street,
      addressLocality: s.address.locality,
      addressRegion: s.address.region,
      addressCountry: s.address.country,
    },
    areaServed: s.areaServed.map((name) => ({ "@type": "City", name })),
    sameAs: [s.facebook, s.line],
    knowsAbout: s.workItems,
  };
}

export function website(site: URL, s: Site) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs(site, "/#website"),
    name: s.name,
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

export function service(site: URL, s: Site, svc: { name: string; type: string; description: string; path: string }, image: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.name,
    serviceType: svc.type,
    description: svc.description,
    url: abs(site, svc.path),
    image,
    provider: { "@id": abs(site, "/#business") },
    areaServed: s.areaServed.map((name) => ({ "@type": "City", name })),
  };
}

export function article(
  site: URL,
  a: { title: string; description: string; path: string; published: string; updated: string },
  image: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url: abs(site, a.path),
    image,
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: "zh-Hant-TW",
    author: { "@id": abs(site, "/#business") },
    publisher: { "@id": abs(site, "/#business") },
    mainEntityOfPage: abs(site, a.path),
  };
}
