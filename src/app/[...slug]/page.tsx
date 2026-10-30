import PageView, { pageMetadata } from "@/components/PageView";
import { PRERENDER, STORE_SLUG, getStorePages } from "@/lib/content";

type Params = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  if (!PRERENDER) return [];
  const pages = await getStorePages(STORE_SLUG);
  return pages.filter((p) => p.slug !== "home").map((p) => ({ slug: p.slug.split("/") }));
}

export async function generateMetadata({ params }: Params) {
  return pageMetadata((await params).slug.map(decodeURIComponent).join("/"));
}

export default async function ContentPage({ params }: Params) {
  return <PageView slug={(await params).slug.map(decodeURIComponent).join("/")} />;
}
