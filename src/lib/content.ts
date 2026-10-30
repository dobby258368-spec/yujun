import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { validateBlocks } from "@/blocks/registry";
import type { Page, Post, Store } from "@/content/types";

// 內容讀取層。函式介面對齊 GEO 前台的 frontend/src/lib/store-data.ts，
// 用 CONTENT_SOURCE 切換來源：
// - local（預設）：讀專案內 content/ 的 JSON，建置時就產生靜態頁
// - api：讀 GEO 公開 API，快取 60 秒並掛上 storeTag，GEO 儲存後打 /api/revalidate 立即失效

const SOURCE = process.env.CONTENT_SOURCE === "api" ? "api" : "local";
const API_URL = process.env.GEO_API_URL || "http://backend:8000";
const CONTENT_DIR = path.join(process.cwd(), "content");

export const STORE_SLUG = process.env.STORE_SLUG || "yujun";
export const REVALIDATE_SECONDS = 60;
export const storeTag = (storeSlug: string) => `store:${storeSlug}`;

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(CONTENT_DIR, file), "utf8"));
}

// 後端回 404 → null；其他錯誤丟例外，避免把暫時故障當成頁面消失
async function getJson<T>(storeSlug: string, apiPath: string): Promise<T | null> {
  const url = `${API_URL}/api/v1/public/stores/${encodeURIComponent(storeSlug)}${apiPath}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS, tags: [storeTag(storeSlug)] } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

function assertValid(page: Page) {
  const errors = validateBlocks(page.content, `pages/${page.slug}`);
  if (errors.length) throw new Error(`內容格式錯誤：\n${errors.join("\n")}`);
}

export const getStore = cache(async (storeSlug: string): Promise<Store | null> =>
  SOURCE === "local" ? readJson<Store>("store.json") : getJson<Store>(storeSlug, ""),
);

export const getStorePage = cache(async (storeSlug: string, pageSlug: string): Promise<Page | null> => {
  let page: Page | null;
  if (SOURCE === "local") {
    page = await readJson<Page>(`pages/${pageSlug.replaceAll("/", "__")}.json`).catch(() => null);
    if (page && !page.is_published) page = null;
  } else {
    // slug 可能含 /，GEO 端需要以 {page_slug:path} 接收
    page = await getJson<Page>(storeSlug, `/pages/${pageSlug.split("/").map(encodeURIComponent).join("/")}`);
  }
  if (page) assertValid(page);
  return page;
});

// 回傳已發佈頁面的完整內容（含 meta），依 sort_order 排序。
// GEO 的清單 API 只回 slug/title/sort_order，所以 api 模式下逐頁再取一次
export const getStorePages = cache(async (storeSlug: string): Promise<Page[]> => {
  let pages: Page[];
  if (SOURCE === "local") {
    const files = await fs.readdir(path.join(CONTENT_DIR, "pages"));
    pages = (await Promise.all(files.map((f) => readJson<Page>(`pages/${f}`)))).filter((p) => p.is_published);
    pages.forEach(assertValid);
  } else {
    const list = (await getJson<{ slug: string }[]>(storeSlug, "/pages")) ?? [];
    pages = (await Promise.all(list.map((p) => getStorePage(storeSlug, p.slug)))).filter((p): p is Page => p !== null);
  }
  return pages.sort((a, b) => a.sort_order - b.sort_order);
});

export const getStorePost = cache(async (storeSlug: string, postSlug: string): Promise<Post | null> => {
  if (SOURCE === "api") return getJson<Post>(storeSlug, `/posts/${encodeURIComponent(postSlug)}`);
  const post = await readJson<Post>(`posts/${postSlug}.json`).catch(() => null);
  return post?.status === "PUBLISHED" ? post : null;
});

// 已發佈文章，依 created_at 由新到舊（與 GEO 相同）。api 模式同樣逐篇取完整內容以拿到 meta
export const getStorePosts = cache(async (storeSlug: string): Promise<Post[]> => {
  let posts: Post[];
  if (SOURCE === "local") {
    const files = await fs.readdir(path.join(CONTENT_DIR, "posts"));
    posts = (await Promise.all(files.map((f) => readJson<Post>(`posts/${f}`)))).filter((p) => p.status === "PUBLISHED");
  } else {
    const list = (await getJson<{ slug: string }[]>(storeSlug, "/posts")) ?? [];
    posts = (await Promise.all(list.map((p) => getStorePost(storeSlug, p.slug)))).filter((p): p is Post => p !== null);
  }
  return posts.sort((a, b) => b.created_at.localeCompare(a.created_at));
});

// 網址路徑 ↔ 頁面 slug：/ 對應 home，/services/turnkey/ 對應 services/turnkey
export const pagePath = (slug: string) => (slug === "home" ? "/" : `/${slug}/`);
