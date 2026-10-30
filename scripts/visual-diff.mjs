// 逐頁截圖比對兩個網站版本，確認改版沒有改變畫面
// 用法：node scripts/visual-diff.mjs <基準網址> <新版網址>
//   例：node scripts/visual-diff.mjs http://localhost:3101 http://localhost:3100
//
// - 頁面清單取自新版的 /sitemap.xml，另外加一個不存在的頁面測 404
// - 每頁用桌面（1440）與手機（390）寬度各拍兩次：「版面」隱藏所有圖片只比版面與文字，「含圖」連圖片一起比
// - 地圖 iframe 一律隱藏；動畫依 prefers-reduced-motion 關閉
// - 有差異的頁面把差異圖存到 .visual-diff/
// - 需要本機安裝 Chrome（playwright-core 使用 channel: "chrome"，不另外下載瀏覽器）
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [base, head] = process.argv.slice(2).map((u) => u?.replace(/\/$/, ""));
if (!base || !head) {
  console.error("用法：node scripts/visual-diff.mjs <基準網址> <新版網址>");
  process.exit(1);
}

const OUT = path.resolve(import.meta.dirname, "../.visual-diff");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const sitemap = await (await fetch(`${head}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
paths.push("/__visual-diff-404__/");

const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const browser = await chromium.launch({ channel: "chrome" });

async function shoot(page, url, hideImages) {
  await page.goto(url, { waitUntil: "networkidle" });
  // 捲到底觸發延遲載入，再等所有圖片載完
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.addStyleTag({ content: `iframe{visibility:hidden!important} ${hideImages ? "img{visibility:hidden!important}" : ""}` });
  await page.waitForTimeout(150);
  return PNG.sync.read(await page.screenshot({ fullPage: true }));
}

const rows = [];
let failed = false;
for (const [vpName, vp] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const p of paths) {
    for (const hide of [true, false]) {
      const a = await shoot(page, base + p, hide);
      const b = await shoot(page, head + p, hide);
      const sameSize = a.width === b.width && a.height === b.height;
      let diff = "尺寸不同";
      if (sameSize) {
        const out = new PNG({ width: a.width, height: a.height });
        const n = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.1 });
        diff = `${((n / (a.width * a.height)) * 100).toFixed(3)}%`;
        if (n > 0) fs.writeFileSync(path.join(OUT, `${vpName}${p.replaceAll("/", "_")}${hide ? "_版面" : "_含圖"}.png`), PNG.sync.write(out));
      }
      // 版面差異超過 0.05% 或高度不同就視為有變動（字形反鋸齒的雜訊約在 0.01% 以下）
      if (!sameSize || (hide && parseFloat(diff) > 0.05)) failed = true;
      rows.push({ 寬度: vpName, 頁面: p, 模式: hide ? "版面" : "含圖", 基準高度: a.height, 新版高度: b.height, 差異: diff });
    }
  }
  await ctx.close();
}
await browser.close();
console.table(rows);
console.log(failed ? "有頁面的版面不同，請看 .visual-diff/ 的差異圖" : "版面一致");
process.exit(failed ? 1 : 0);
