// 模擬 GEO 後台頁面 API 用的本機資料層（只給 src/app/api/v1/ 使用，只在 next dev 開放，不搬進 GEO）。
// 回應格式同 GEO 的 page_to_dict；id 用檔名，改 slug 時記下舊 id，對應 GEO 不會變動的 UUID
import fs from "node:fs/promises";
import path from "node:path";
import type { Page } from "@/content/types";

export const DEV = process.env.NODE_ENV === "development";
export const notFound = () => Response.json({ detail: "Not Found" }, { status: 404 });

const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const idOf = (slug: string) => slug.replaceAll("/", "__");
export const fileOf = (slug: string) => path.join(PAGES_DIR, `${idOf(slug)}.json`);

const aliases: Map<string, string> = ((globalThis as { __devPageAliases?: Map<string, string> }).__devPageAliases ??= new Map());

export const toDict = (page: Page) => ({ id: idOf(page.slug), ...page, created_at: new Date(0).toISOString() });

export async function listPages(): Promise<Page[]> {
  const files = await fs.readdir(PAGES_DIR);
  const pages = await Promise.all(files.map(async (f) => JSON.parse(await fs.readFile(path.join(PAGES_DIR, f), "utf8")) as Page));
  return pages.sort((a, b) => a.sort_order - b.sort_order);
}

export async function findPage(id: string): Promise<Page | null> {
  if (!/^[a-z0-9_-]+$/.test(id)) return null;
  const current = aliases.get(id) ?? id;
  return fs.readFile(path.join(PAGES_DIR, `${current}.json`), "utf8").then((s) => JSON.parse(s) as Page, () => null);
}

export async function savePage(page: Page, previousSlug?: string) {
  const clean: Page = {
    sort_order: page.sort_order ?? 0,
    is_published: page.is_published ?? false,
    meta: page.meta ?? null,
    slug: page.slug,
    title: page.title,
    seo_title: page.seo_title ?? null,
    seo_description: page.seo_description ?? null,
    content: page.content ?? [],
  };
  await fs.writeFile(fileOf(page.slug), JSON.stringify(clean, null, 2) + "\n");
  if (previousSlug && previousSlug !== page.slug) {
    await fs.rm(fileOf(previousSlug), { force: true });
    aliases.set(idOf(previousSlug), idOf(page.slug));
    for (const [from, to] of aliases) if (to === idOf(previousSlug)) aliases.set(from, idOf(page.slug));
  }
  return clean;
}

export const slugExists = (slug: string) => fs.access(fileOf(slug)).then(() => true, () => false);
