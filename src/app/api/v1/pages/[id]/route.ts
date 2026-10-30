import fs from "node:fs/promises";
import { SLUG_PATTERN } from "@/components/templates/yujun/registry";
import type { Page } from "@/content/types";
import { DEV, fileOf, findPage, notFound, savePage, slugExists, toDict } from "@/lib/dev-pages";

// 模擬 GEO 的 backend/app/api/pages.py（開發用，不搬進 GEO）
type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  if (!DEV) return notFound();
  const page = await findPage((await params).id);
  return page ? Response.json(toDict(page)) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  if (!DEV) return notFound();
  const page = await findPage((await params).id);
  if (!page) return notFound();
  const patch = (await request.json()) as Partial<Page>;
  const next = { ...page, ...patch };
  if (next.slug !== page.slug) {
    if (page.slug === "home") return Response.json({ detail: "無法修改系統預設首頁的網址" }, { status: 400 });
    if (!SLUG_PATTERN.test(next.slug)) return Response.json({ detail: "slug 格式錯誤" }, { status: 422 });
    if (await slugExists(next.slug)) return Response.json({ detail: `此品牌已有 slug 為 '${next.slug}' 的頁面` }, { status: 400 });
  }
  return Response.json(toDict(await savePage(next, page.slug)));
}

export async function DELETE(_: Request, { params }: Params) {
  if (!DEV) return notFound();
  const page = await findPage((await params).id);
  if (!page) return notFound();
  await fs.rm(fileOf(page.slug), { force: true });
  return Response.json({ status: "deleted" });
}
