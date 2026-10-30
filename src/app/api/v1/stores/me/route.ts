import fs from "node:fs/promises";
import path from "node:path";
import { DEV, notFound } from "@/lib/dev-pages";

// 模擬 GEO 的 GET /api/v1/stores/me：編輯器只用到 slug 與 site_template（開發用，不搬進 GEO）
export async function GET() {
  if (!DEV) return notFound();
  return new Response(await fs.readFile(path.join(process.cwd(), "content", "store.json")), {
    headers: { "Content-Type": "application/json" },
  });
}
