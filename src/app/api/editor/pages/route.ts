import fs from "node:fs/promises";
import path from "node:path";
import { SLUG_PATTERN, validatePage } from "@/blocks/registry";
import type { Page } from "@/content/types";

// 開發用編輯器的存檔 API：寫回 content/pages/*.json。只在 next dev 開放；
// 搬進 GEO 後改由 GEO 後台的頁面 API 處理
const DEV = process.env.NODE_ENV === "development";
const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const fileOf = (slug: string) => path.join(PAGES_DIR, `${slug.replaceAll("/", "__")}.json`);
const exists = (f: string) => fs.access(f).then(() => true, () => false);
const notFound = () => Response.json({ detail: "Not Found" }, { status: 404 });

// 新增或更新：body 為 { original_slug?: string, page: Page }；改 slug 時刪掉舊檔
export async function PUT(request: Request) {
  if (!DEV) return notFound();
  const { original_slug, page } = (await request.json()) as { original_slug?: string; page: Page };

  if (original_slug !== undefined && !SLUG_PATTERN.test(original_slug)) return Response.json({ detail: ["original_slug 格式錯誤"] }, { status: 400 });
  const errors = validatePage(page);
  if (errors.length) return Response.json({ detail: errors }, { status: 400 });
  if (original_slug === "home" && page.slug !== "home") return Response.json({ detail: ["首頁的 slug 不能修改"] }, { status: 400 });
  if (page.slug !== original_slug && (await exists(fileOf(page.slug)))) {
    return Response.json({ detail: [`slug「${page.slug}」已經被其他頁面使用`] }, { status: 409 });
  }

  const clean: Page = {
    sort_order: page.sort_order,
    is_published: page.is_published,
    meta: page.meta,
    slug: page.slug,
    title: page.title.trim(),
    seo_title: page.seo_title || null,
    seo_description: page.seo_description || null,
    content: page.content,
  };
  await fs.writeFile(fileOf(page.slug), JSON.stringify(clean, null, 2) + "\n");
  if (original_slug && original_slug !== page.slug) await fs.rm(fileOf(original_slug), { force: true });
  return Response.json(clean);
}

export async function DELETE(request: Request) {
  if (!DEV) return notFound();
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug || !SLUG_PATTERN.test(slug)) return Response.json({ detail: ["slug 格式錯誤"] }, { status: 400 });
  if (slug === "home") return Response.json({ detail: ["首頁不能刪除"] }, { status: 400 });
  await fs.rm(fileOf(slug), { force: true });
  return Response.json({ deleted: slug });
}
