import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// 開發用編輯器的圖片上傳：存到 public/uploads/yujun/。只在 next dev 開放。
// 格式與大小限制同 GEO 的 backend/app/api/uploads.py；搬進 GEO 後改用 GEO 的上傳 API
const DEV = process.env.NODE_ENV === "development";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "yujun");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!DEV) return Response.json({ detail: "Not Found" }, { status: 404 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return Response.json({ detail: "只能上傳圖片檔" }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json({ detail: "僅支援 JPG、PNG、GIF、WebP 格式的圖片" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return Response.json({ detail: "圖片大小不可超過 10MB" }, { status: 400 });
  }

  const filename = `${randomUUID().replaceAll("-", "")}${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
  return Response.json(`/uploads/yujun/${filename}`);
}
