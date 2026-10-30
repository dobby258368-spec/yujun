# 宥涒室內裝潢網站

Next.js 16（與 GEO-Saas 前台同版本）。內容格式對齊 GEO，可以讀本機 `content/` 或 GEO 公開 API。
待辦與部署路徑的討論見 `TODOS.md`，搬進 GEO 的規格見 `geo/GEO-INTEGRATION.md`。

## 開發

```bash
npm install
npm run dev          # http://localhost:3000，網站
                     # http://localhost:3000/dashboard/website/，編輯器（只在 dev 開放，存檔寫回 content/）
npm run build && npm start   # 正式模式
```

## 目錄

| 路徑 | 內容 |
|---|---|
| `content/` | 網站內容（GEO 格式）：`store.json`、`pages/*.json`（slug 的 `/` 存成 `__`）、`posts/*.json` |
| `public/uploads/yujun/` | 內容用到的圖片 |
| `src/app/(site)/` | 前台頁面：首頁、`[...slug]`（所有內容頁）、`blog/[slug]` |
| `src/app/(editor)/dashboard/website/`、`src/components/blocks/BlockEditor.tsx` | GEO 的編輯頁（副本，只加擴充點，與 GEO 的差異即 `geo/patches/`）。有自己的根 layout 與 Tailwind，不影響前台 |
| `src/components/templates/yujun/` | 接進 GEO 編輯器的 yujun 模組：區塊型別、欄位定義與驗證（`registry.ts`）、表單（`FieldInput.tsx`） |
| `src/components/templates/yujun/preview/` | 即時預覽模組（選配） |
| `src/app/api/v1/`、`src/lib/dev-pages.ts` | 模擬 GEO 後台 API，讀寫本機 `content/`（只在 dev 開放，不搬進 GEO） |
| `src/blocks/BlockRenderer.tsx` | yujun 區塊的前台渲染 |
| `src/lib/content.ts` | 內容讀取層，介面同 GEO 的 `store-data.ts` |
| `deploy/` | Dockerfile 的使用方式與 nginx、compose 範例 |
| `geo/` | 嫁接用的 patch 與腳本、整合規格、migration、匯入腳本（定案前不執行） |
| `scripts/` | `visual-diff.mjs`（截圖比對）、`mock-geo-api.mjs`（模擬 GEO 公開 API） |

## 內容來源

| `CONTENT_SOURCE` | 行為 |
|---|---|
| `local`（預設） | 讀 `content/`，建置時產生靜態頁 |
| `api` | 讀 GEO 公開 API（`GEO_API_URL`），頁面第一次請求時產生並快取 60 秒，GEO 呼叫 `/api/revalidate/` 立即更新 |

本機測試 api 模式：

```bash
node scripts/mock-geo-api.mjs 3200
CONTENT_SOURCE=api GEO_API_URL=http://localhost:3200 NEXT_PUBLIC_GEO_PUBLIC_URL=http://localhost:3200 npm run dev
```

## 確認畫面沒變

```bash
npm run visual-diff -- <舊版網址> <新版網址>
```

逐頁比對桌面與手機版截圖（頁面清單取自新版的 sitemap），差異圖存在 `.visual-diff/`。需要本機安裝 Chrome。
