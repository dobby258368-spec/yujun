// 模擬 GEO 公開 API：把 content/ 以 GEO 的回應格式提供出來，用來測試 CONTENT_SOURCE=api
// 用法：node scripts/mock-geo-api.mjs [port]（預設 3200）
//   CONTENT_SOURCE=api GEO_API_URL=http://localhost:3200 NEXT_PUBLIC_GEO_PUBLIC_URL=http://localhost:3200 npm run dev
//
// 清單 API 的欄位與 GEO 相同（只有 slug、title 等）；單頁 API 多回傳 GEO 尚未有的擴充欄位（meta 等）
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const port = Number(process.argv[2] || 3200);
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "content", f), "utf8"));
const all = (dir) => fs.readdirSync(path.join(root, "content", dir)).map((f) => read(`${dir}/${f}`));
const types = { ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

function route(pathname) {
  if (pathname.startsWith("/uploads/")) return { file: path.join(root, "public", pathname) };
  const m = pathname.match(/^\/api\/v1\/public\/stores\/([^/]+)(\/.*)?$/);
  if (!m) return null;
  const store = read("store.json");
  if (decodeURIComponent(m[1]) !== store.slug) return null;
  const rest = m[2] ?? "";
  if (rest === "") return { json: store };
  if (rest === "/pages") {
    return { json: all("pages").filter((p) => p.is_published).sort((a, b) => a.sort_order - b.sort_order).map(({ slug, title, sort_order }) => ({ slug, title, sort_order })) };
  }
  if (rest.startsWith("/pages/")) {
    const slug = rest.slice(7).split("/").map(decodeURIComponent).join("/");
    const page = all("pages").find((p) => p.slug === slug && p.is_published);
    return page ? { json: { ...page, store_name: store.name } } : null;
  }
  if (rest === "/posts") {
    return { json: all("posts").filter((p) => p.status === "PUBLISHED").sort((a, b) => b.created_at.localeCompare(a.created_at)).map(({ slug, title, excerpt, created_at, updated_at }) => ({ slug, title, excerpt, created_at, updated_at })) };
  }
  if (rest.startsWith("/posts/")) {
    const post = all("posts").find((p) => p.slug === decodeURIComponent(rest.slice(7)) && p.status === "PUBLISHED");
    return post ? { json: { ...post, store_name: store.name, store_target_keywords: store.target_keywords } } : null;
  }
  return null;
}

http
  .createServer((req, res) => {
    const r = route(new URL(req.url, "http://x").pathname);
    if (r?.json) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(r.json));
    }
    if (r?.file && r.file.startsWith(path.join(root, "public")) && fs.existsSync(r.file)) {
      res.writeHead(200, { "Content-Type": types[path.extname(r.file)] || "application/octet-stream" });
      return fs.createReadStream(r.file).pipe(res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ detail: "Not Found" }));
  })
  .listen(port, () => console.log(`mock GEO API on http://localhost:${port}`));
