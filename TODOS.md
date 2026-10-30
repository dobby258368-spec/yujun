# 宥涒室內裝潢：待辦事項

## 原則：定案前不動 GEO

部署路徑還沒定案（見下方「兩條路」）。在定案之前：

- **GEO-Saas 一行都不改**：程式、資料庫、設定、正式機都不碰。可以讀 GEO 的程式碼當作參考。
- 所有工作都在這個專案裡完成，目標是做到「選融合就搬進 GEO、選獨立就直接上線」都不用重寫。
- 需要 GEO 配合的部分，只寫成規格文件或腳本，**只寫不跑**。
- 依照 GEO 設計的格式（API 回應、block 結構、編輯器操作方式）一律對照 GEO commit `00373bc`。定案時先比對 GEO 在那之後的改動，再開始搬。

## 兩條路（待定案）

兩條路的共同前提：**內容和編輯都放在 GEO**。宥涒的使用者跟其他品牌用同一個後台、一樣的操作方式，只是編輯元件是宥涒專屬的。

| | 融合 | 獨立 |
|---|---|---|
| 前台 | 由 GEO 的 Next 渲染。品牌多一個「網站類型」欄位（`classic` 或 `yujun`），yujun 類型走獨立的 route group，有自己的根 layout 和 CSS | 這個專案自己打包成容器，建置時跟 GEO 前台用一樣的 standalone Dockerfile，從 GEO API 讀內容 |
| 存檔後生效 | 沿用 GEO 現有的 revalidate | GEO 存檔後通知 yujun 容器的 `/api/revalidate` |
| 部署位置 | GEO 正式機 | GEO 正式機（nginx 加一個 server 區塊）或新 VM |

不論選哪條路，「網站類型」都要能切換，而且切換時兩種版本的內容都要保留。

## 已完成

- [x] git 初始化，Astro 版存成 tag `astro-baseline`
- [x] 改用跟 GEO 同版本的 Next.js 16.3.0 + React 19.2.8，tsconfig、eslint、`output: "standalone"` 都跟 GEO 一致
- [x] 所有頁面和元件改寫成 React，`global.css` 原封沿用
- [x] 站內連結改用 `next/link`，圖片改用 `next/image`
- [x] 截圖比對：33 頁 × 桌面與手機兩種寬度，頁面高度全部一致，版面差異不超過 0.011%

## 定案前可以先做（只動這個專案）

依序做：

- [ ] **內容改成 GEO 的資料格式**（2–2.5 天）
  - `src/data/*.ts` 和 `posts.json` 轉成 `content/*.json`，結構對齊 GEO 公開 API 的 Store、Page（`content.blocks`）、Post
  - yujun 專屬的 block（輪播、拼貼圖、磚格、FAQ、服務內容、案例圖集、流程步驟）用 TypeScript 型別加上驗證定義出來
- [ ] **資料存取層**（含在上一項）
  - 寫 `getStore / getPages / getPage / getPosts`，函式介面跟 GEO 的 `frontend/src/lib/store-data.ts` 一致
  - 用環境變數切換來源：`local`（讀 JSON）或 `api`（讀 GEO）
- [ ] **圖片改存網址**（0.5 天）
  - 內容裡的圖片改存網址，跟 GEO 的 `/uploads/...` 一樣，由 next/image 設定遠端圖片來源
  - 之後就不必維護 `src/lib/images.ts` 的靜態 import 清單
- [ ] **開發用編輯器 `/_editor`**（4–6 天）
  - 操作方式和外觀參考 GEO 的 `BlockEditor.tsx`，可以加 Tailwind，但只限編輯器頁面使用，不可影響前台畫面
  - 介面設計成 `blocks` 加 `onChange`，上傳功能由外部傳入，搬進 GEO 後台時只要接上 API
  - 右邊即時預覽，存檔寫回 JSON。只在開發模式開放
- [ ] **部署檔**（0.5 天）：Dockerfile（照抄 GEO 前台的版本）、`/api/revalidate`、nginx 設定範例
- [ ] **`GEO-INTEGRATION.md` 整合規格和匯入腳本**（1–1.5 天）
  - 列出 GEO 要做的 migration 草稿、API 修改、依類型驗證 block 的對照表，兩條路分別列出
  - 匯入腳本預設 dry-run，只寫不跑
- [ ] **把截圖比對工具放進專案**（0.5 天）：目前放在暫存資料夾，之後每次改版都要能重跑

小計約 9–12 天。

## 定案後才能做（要動 GEO）

**兩條路都要做**
- [ ] GEO 資料層：`stores.site_template`、`pages.template`，唯一索引改成 `(store_id, template, slug)`，後端依類型驗證 block
- [ ] 編輯器接進 GEO 後台，建立網站時選類型、切換類型的 UI（含切換前預覽）
- [ ] 執行宥涒內容匯入
- [ ] 回歸測試：現有 classic 品牌的每一頁都不能變

**只有融合要做**（約 8–10 天）
- [ ] GEO 前台：現有程式移進 `(platform)` route group，新增 `(tpl-yujun)`，由 middleware 依品牌類型改寫路徑
- [ ] 自訂網域：middleware 依 Host 找品牌，canonical 和 sitemap 改用該網域，修正爬蟲追蹤用網址第一段判斷品牌的問題

**只有獨立要做**（約 7–9 天）
- [ ] GEO 存檔後也通知 yujun 容器 revalidate
- [ ] nginx server 區塊、申請憑證
- [ ] AI 爬蟲追蹤：讀 nginx log 篩選爬蟲，寫進 GEO 的追蹤表

## 待決定

- [ ] 部署路徑：融合還是獨立
- [ ] 文章（Post）要兩種類型共用，還是各自一套（建議共用）
- [ ] 宥涒用自己的網域，還是 `geoseo-service.com/yujun/`
- [ ] 服務頁要不要開放後台編輯（建議先不開放，只開放案例、文章、FAQ、首頁輪播）
- [ ] 正式網域：建置時要帶 `SITE_URL`，目前預設是 `https://example.com`

## 注意事項

- 新增圖片時，要在 `src/lib/images.ts` 補上 import 和對照，否則建置會失敗。完成「圖片改存網址」之後就不需要了。
- 不要在前台加 Tailwind 的全域樣式（preflight），它會改變畫面。
