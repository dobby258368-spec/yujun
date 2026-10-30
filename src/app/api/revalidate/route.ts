import { revalidatePath, revalidateTag } from "next/cache";
import { storeTag } from "@/lib/content";

// GEO 在品牌、頁面、文章儲存後呼叫，讓前台快取立即失效（不必等 60 秒）。做法與 GEO 前台的同名 route 相同。
// 和 GEO 同機時只開放 docker 內網；放在別台機器時設定 REVALIDATE_SECRET，GEO 要帶 x-revalidate-secret 標頭。
// 網址要帶結尾斜線（/api/revalidate/），否則 trailingSlash 會先回 308，POST 不會跟著轉址
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ revalidated: false, message: "forbidden" }, { status: 403 });
  }

  let storeSlug: unknown;
  try {
    storeSlug = (await request.json())?.store_slug;
  } catch {
    // body 不是 JSON，交給下面回 400
  }
  if (typeof storeSlug !== "string" || !storeSlug) {
    return Response.json({ revalidated: false, message: "store_slug is required" }, { status: 400 });
  }

  revalidateTag(storeTag(storeSlug), { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
