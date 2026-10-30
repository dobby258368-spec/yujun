import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PreviewClient from "@/components/templates/yujun/preview/PreviewClient";
import { STORE_SLUG, getStore, getStorePages, getStorePosts } from "@/lib/content";
import { siteOf } from "@/lib/site";

export const metadata: Metadata = { title: "預覽", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// 即時預覽模組的前台預覽頁。next dev 一律開放；正式環境要設定 ENABLE_EDITOR_PREVIEW 才開放
export default async function EditorPreview() {
  if (process.env.NODE_ENV !== "development" && !process.env.ENABLE_EDITOR_PREVIEW) notFound();
  const [store, pages, posts] = await Promise.all([getStore(STORE_SLUG), getStorePages(STORE_SLUG), getStorePosts(STORE_SLUG)]);
  if (!store) notFound();
  return <PreviewClient site={siteOf(store)} pages={pages} posts={posts} />;
}
