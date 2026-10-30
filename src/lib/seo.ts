import type { Metadata } from "next";
import { SITE } from "@/data/site";
import { img } from "@/lib/images";

// 正式網域確定後，建置時帶入：SITE_URL=https://你的網域 npm run build
// canonical、sitemap、OG、JSON-LD 的網址都從這裡產生
export const SITE_URL = new URL(process.env.SITE_URL || "https://example.com");

export const DEFAULT_IMAGE = "f5266cb3b649429c9de3da2e7a2ef376.png";

// OG 圖：寬 1200，交給 next/image 縮圖
export function ogImageUrl(name: string) {
  const path = `/_next/image?url=${encodeURIComponent(img(name).src)}&w=1200&q=75`;
  return new URL(path, SITE_URL).href;
}

export function pageMeta({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const url = new URL(path, SITE_URL).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: SITE.name,
      locale: "zh_TW",
      title,
      description,
      url,
      images: [ogImageUrl(image)],
    },
    twitter: { card: "summary_large_image" },
  };
}
