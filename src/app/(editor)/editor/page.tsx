import fs from "node:fs/promises";
import path from "node:path";
import Editor from "@/editor/Editor";
import { STORE_SLUG, getStore, getStorePosts } from "@/lib/content";
import { siteOf } from "@/lib/site";
import type { Page } from "@/content/types";

export const dynamic = "force-dynamic";

// 編輯器要看到所有頁面（含未發佈），所以直接讀 content/pages，不經過只回已發佈頁面的 getStorePages
async function allPages(): Promise<Page[]> {
  const dir = path.join(process.cwd(), "content", "pages");
  const files = await fs.readdir(dir);
  const pages = await Promise.all(files.map(async (f) => JSON.parse(await fs.readFile(path.join(dir, f), "utf8")) as Page));
  return pages.sort((a, b) => a.sort_order - b.sort_order);
}

export default async function EditorPage() {
  const [store, pages, posts] = await Promise.all([getStore(STORE_SLUG), allPages(), getStorePosts(STORE_SLUG)]);
  if (!store) throw new Error(`找不到品牌資料：${STORE_SLUG}`);
  return <Editor site={siteOf(store)} initialPages={pages} posts={posts} />;
}
