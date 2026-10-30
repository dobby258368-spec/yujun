import { SLUG_PATTERN } from "@/components/templates/yujun/registry";
import type { Page } from "@/content/types";
import { DEV, listPages, notFound, savePage, slugExists, toDict } from "@/lib/dev-pages";

// 模擬 GEO 的 backend/app/api/pages.py（開發用，不搬進 GEO）
export async function GET() {
  if (!DEV) return notFound();
  return Response.json((await listPages()).map(toDict));
}

export async function POST(request: Request) {
  if (!DEV) return notFound();
  const body = (await request.json()) as Page;
  if (!SLUG_PATTERN.test(body.slug ?? "")) return Response.json({ detail: "slug 格式錯誤" }, { status: 422 });
  if (await slugExists(body.slug)) return Response.json({ detail: `此品牌已有 slug 為 '${body.slug}' 的頁面` }, { status: 400 });
  return Response.json(toDict(await savePage(body)));
}
