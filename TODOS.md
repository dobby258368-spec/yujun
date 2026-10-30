# 宥涒室內裝潢：待辦事項

## 原則：定案前不動 GEO

部署路徑還沒定案（見下方「兩條路」）。在定案之前：

- **GEO-Saas 一行都不改**：程式、資料庫、設定、正式機都不碰。可以讀 GEO 的程式碼當作參考。
- 所有工作都在這個專案裡完成，目標是做到「選融合就搬進 GEO、選獨立就直接上線」都不用重寫。
- 需要 GEO 配合的部分，只寫成規格文件或腳本（放在 `geo/`），**只寫不跑**。
- 依照 GEO 設計的格式（API 回應、block 結構、編輯器操作方式）一律對照 GEO commit `00373bc`。定案時先比對 GEO 在那之後的改動，再開始搬。

## 兩條路（待定案）

兩條路的共同前提：**內容和編輯都放在 GEO**。宥涒在 GEO 上就是品牌 `enjoy-no1`，使用者跟其他品牌用同一個後台、一樣的操作方式，只是編輯元件是宥涒專屬的。

| | 融合 | 獨立 |
|---|---|---|
| 前台 | 由 GEO 的 Next 渲染。品牌多一個「網站類型」欄位（`classic` 或 `yujun`），yujun 類型走獨立的 route group，有自己的根 layout 和 CSS | 這個專案自己打包成容器（`CONTENT_SOURCE=api`），從 GEO API 讀內容 |
| 存檔後生效 | 沿用 GEO 現有的 revalidate | GEO 存檔後通知 yujun 容器的 `/api/revalidate/` |
| 部署位置 | GEO 正式機 | GEO 正式機（nginx 加一個 server 區塊）或新 VM |

不論選哪條路，「網站類型」都要能切換，而且切換時兩種版本的內容都要保留。

## 已完成

- [x] git 初始化，Astro 版存成 tag `astro-baseline`
- [x] 改用跟 GEO 同版本的 Next.js 16.3.0 + React 19.2.8，tsconfig、eslint、`output: "standalone"` 都跟 GEO 一致
- [x] 內容改成 GEO 的資料格式（`content/`：store、22 個 page、10 篇 post），頁面由 block 組成
  - yujun 的 18 種 block 定義在 `src/blocks/`（型別、欄位、驗證），GEO 沒有的欄位標為「擴充」
- [x] 資料存取層 `src/lib/content.ts`，介面同 GEO 的 `store-data.ts`；`CONTENT_SOURCE=local|api` 切換
  - 用 `scripts/mock-geo-api.mjs` 驗證過 api 模式：輸出與 local 模式逐頁相同，revalidate 立即生效，建置時不需連線 GEO
- [x] 圖片改存網址（`public/uploads/yujun/`），支援 GEO 的相對與絕對網址
- [x] 開發用編輯器 `/editor/`（只在 `npm run dev` 開放）：GEO 後台風格、欄位由 registry 產生、即時預覽、存檔、上傳
- [x] 部署檔：`Dockerfile`、`deploy/`（GEO 同機與獨立 VM 兩種範例）、`/api/revalidate/`；docker 實測可建置與執行
- [x] `geo/`：整合規格 `GEO-INTEGRATION.md`、`migration.sql`、匯入腳本 `import_yujun.py`（只寫不跑）
- [x] 截圖比對工具 `npm run visual-diff`；每個階段都比對過，頁面高度全部一致，版面差異不超過 0.011%

## 定案後才能做（要動 GEO）

細節見 `geo/GEO-INTEGRATION.md`。

**兩條路都要做**
- [ ] 執行 `migration.sql`，修改 Store、Page、Post model（第 2.1、2.2 節）
- [ ] 公開 API 與後台 API 加上類型與 meta（第 2.3、2.4 節）
- [ ] 編輯器接進 GEO 後台，建立網站時選類型、切換類型的 UI（含切換前預覽）（第 2.5、2.6 節）
- [ ] 執行宥涒內容匯入（第 5 節）
- [ ] 回歸測試：現有 classic 品牌的每一頁都不能變

**只有融合要做**（約 8–10 天，第 3 節）
- [ ] GEO 前台：現有程式移進 `(platform)` route group，新增 `(tpl-yujun)`，由 middleware 依品牌類型改寫路徑
- [ ] 自訂網域：middleware 依 Host 找品牌，canonical 和 sitemap 改用該網域，修正爬蟲追蹤用網址第一段判斷品牌的問題

**只有獨立要做**（約 7–9 天，第 4 節）
- [ ] GEO 存檔後也通知 yujun 容器 revalidate
- [ ] nginx server 區塊、申請憑證
- [ ] AI 爬蟲追蹤：讀 nginx log 篩選爬蟲，寫進 GEO 的追蹤表

## 待決定

- [ ] 部署路徑：融合還是獨立
- [ ] 文章（Post）要兩種類型共用，還是各自一套（目前規格以共用設計）
- [ ] 宥涒用自己的網域，還是 `geoseo-service.com/enjoy-no1/`
- [ ] 服務頁要不要開放後台編輯（目前編輯器有開放）
- [ ] 正式網域：建置時要帶 `SITE_URL`，目前預設是 `https://example.com`

## 注意事項

- 不要在前台加 Tailwind 的全域樣式（preflight），它會改變畫面。Tailwind 只在 `(editor)` route group 使用。
- 改版後跑 `npm run visual-diff -- <舊版網址> <新版網址>` 確認畫面沒變。
- `content/` 是 local 模式的內容來源，也是匯入 GEO 的來源；用編輯器改完記得 commit。
