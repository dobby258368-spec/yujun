# 宥涒室內裝潢：嫁接待辦

定案前能在這個專案內先做的都已完成（紀錄見 git log）。以下全部是嫁接 GEO 要做的事，細節規格見 [geo/GEO-INTEGRATION.md](geo/GEO-INTEGRATION.md)。

## 原則：定案前不動 GEO

- **GEO-Saas 一行都不改**：程式、資料庫、設定、正式機都不碰，只能讀。
- `geo/` 裡的檔案（patch、腳本、SQL）定案前只寫不跑。
- 所有格式都對照 GEO commit `00373bc`。

## 開工前要決定

- [ ] **部署路徑**：融合（GEO 的 Next 渲染宥涒前台）或獨立（這個專案自己一個容器）。只影響第 5 步。
- [ ] **網域**：宥涒用自己的網域，還是 `geoseo-service.com/enjoy-no1/`。正式網域也決定建置時帶的 `SITE_URL`（目前預設 `https://example.com`）。
- [ ] **文章**：兩種類型共用（建議，下面的步驟以此為準），或各自一套（`posts` 要多一個 `template` 欄位）。
- [ ] **服務頁**：要不要開放後台編輯（目前開放）。
- [ ] **Next 升級**：`npm audit` 回報 16.3.0 有 critical 漏洞，修正版本是 16.4.3。GEO 和這個專案都鎖在 16.3.0。建議兩邊一起升級後再嫁接，升級後跑 `npm run visual-diff` 確認畫面。

## 嫁接步驟

每一步做完都可以停：只要品牌的 `site_template` 還是 `classic`，現有網站完全不受影響。

### 1. 比對 GEO 的改動

```bash
git -C <GEO-Saas> diff 00373bc HEAD --stat
git -C <GEO-Saas> apply --check <yujun>/geo/patches/01-editor-core.patch
```

`--check` 失敗表示 GEO 的編輯器檔案改過，要重新產生 patch（把 GEO 新版複製過來，重做同樣的修改）。

### 2. GEO 資料庫與後端

依 `BACKUP.md` 備份後：

- [ ] 執行 `geo/migration.sql`（`stores.site_template`、`stores.template_settings`、`pages.template`、`pages.meta`、`posts.meta`，唯一索引改為 `(store_id, template, slug)`）
- [ ] model 加欄位（規格 2.2）
- [ ] `GET /api/v1/stores/me` 回傳加 `site_template`。**編輯器靠這個欄位分流**，沒有就一律當 classic
- [ ] 後台頁面 API（`pages.py`）：接受 `template`、`meta`；回傳加 `meta`；清單只回 `store.site_template` 的頁面；slug 規則與重複檢查依類型（規格 2.4）
- [ ] 公開 API（`public.py`）：回傳加擴充欄位、`{page_slug:path}`、依類型篩選（規格 2.3）
- [ ] `get_public_page` 自動建立首頁的邏輯只給 classic

### 3. 嫁接編輯器（不含即時預覽）

```bash
bash geo/graft-editor.sh <GEO-Saas>
```

| 動作 | 檔案 |
|---|---|
| 套 patch，加擴充點（共 +83/−22 行，classic 邏輯不動） | `components/blocks/BlockEditor.tsx`、`app/dashboard/website/page.tsx`、`app/dashboard/website/[id]/page.tsx` |
| 新增 yujun 模組 | `components/templates/index.ts`、`components/templates/yujun/`（`index.tsx`、`FieldInput.tsx`、`registry.ts`、`types.ts`） |

另外手動處理：

- [ ] 宥涒用自己的網域時，GEO 前台建置要帶 `NEXT_PUBLIC_YUJUN_SITE_URL`（`frontend/Dockerfile` 要加 ARG）。用 `/enjoy-no1/` 路徑時，刪掉 `yujun/index.tsx` 的 `publicPath`
- [ ] 文章編輯頁在 yujun 類型時多三個欄位：封面、摘要描述、相關服務（規格 2.5，**這部分還沒有程式**）

### 4. 匯入宥涒內容

```bash
cp <yujun>/geo/import_yujun.py <GEO-Saas>/backend/scripts/
docker cp <yujun>/content geo_backend:/tmp/yujun/content
docker cp <yujun>/public/uploads/yujun geo_backend:/tmp/yujun/uploads

docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun          # dry-run，逐項檢查
docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun --apply  # 寫入，品牌仍顯示 classic 版
```

寫入後 `enjoy-no1` 多 22 個 yujun 頁面，classic 頁面不動。先不要加 `--switch`。

### 5. 宥涒前台（依部署路徑擇一）

**融合**（規格第 3 節，估約 8–10 天）

- [ ] GEO 前台現有程式移進 `app/(platform)/`，新增 `app/(tpl-yujun)/`，內容來自這裡的 `src/app/(site)/`、`src/components/`、`src/blocks/BlockRenderer.tsx`、`src/styles/global.css`
- [ ] `src/lib/content.ts` 換成 GEO 的 `lib/store-data.ts`
- [ ] middleware 依 `site_template` 改寫路徑
- [ ] 自訂網域：`custom_domain`、middleware 依 Host 找品牌、canonical 和 sitemap、修正爬蟲追蹤用網址第一段判斷品牌的問題

**獨立**（規格第 4 節，估約 7–9 天）

- [ ] 依 `deploy/README.md` 部署容器（`CONTENT_SOURCE=api`、`STORE_SLUG=enjoy-no1`），放 GEO 正式機或新 VM
- [ ] `revalidate_store_pages` 對 `enjoy-no1` 也呼叫 `/api/revalidate/`（結尾要有斜線）
- [ ] nginx server 區塊、憑證
- [ ] AI 爬蟲追蹤：讀 nginx log 寫進 `AICrawlerLog`

### 6. 網站類型切換

- [ ] 品牌設定（`admin/brands/[storeId]`）加「網站類型」：建立時選，之後可切換；切換前提醒目標類型有沒有頁面
- [ ] 切換前預覽：`?preview_template=yujun`（要驗證身分、不可快取）
- [ ] 決定要不要支援「切換前編輯另一種類型」。目前的編輯頁只編輯 `site_template` 指定的類型，所以匯入後、切換前無法在後台修改 yujun 頁面；要支援的話，頁面清單要多一個類型參數

### 7. 驗收後切換

- [ ] **classic 回歸**：億鑫、豐泰等品牌，每一頁打開不改內容直接存檔，資料庫裡的 `content` 不變；前台每一頁畫面不變
- [ ] **yujun 編輯**：編輯、發佈、新增頁面、上傳加裁切、圖文欄位，都走真的 GEO 後端
- [ ] **yujun 前台**：`npm run visual-diff -- <目前版本> <嫁接後版本>`
- [ ] 全部通過後，`import_yujun --apply --switch` 切換 `enjoy-no1`

## 第一次嫁接之後：即時預覽

預覽是獨立模組，不搬也不影響編輯器（`SiteTemplate.PreviewLayout` 是選配）。

**編輯器端**：

```bash
bash geo/graft-editor.sh <GEO-Saas> --with-preview
```

**前台端**：

- 融合：把 `src/app/(site)/editor-preview/` 和 `yujun/preview/PreviewClient.tsx` 搬進 `(tpl-yujun)`，設定 `ENABLE_EDITOR_PREVIEW=1`；預覽網址要帶品牌路徑，所以 GEO 建置時帶 `NEXT_PUBLIC_YUJUN_PREVIEW_URL`
- 獨立：yujun 容器設定 `ENABLE_EDITOR_PREVIEW=1`，建置時帶 `NEXT_PUBLIC_EDITOR_ORIGIN=<GEO 後台網域>`；GEO 建置時帶 `NEXT_PUBLIC_YUJUN_PREVIEW_URL=<yujun 網域>/editor-preview/`；yujun 的 nginx 要允許 GEO 嵌入，`X-Frame-Options "SAMEORIGIN"` 改成 `Content-Security-Policy "frame-ancestors <GEO 後台網域>"`

**跨網域的情況還沒實測**（目前只測過同網域）。

## 已知限制

- **欄位驗證只在前端**：後端只檢查區塊類型。如果有人繞過編輯頁直接呼叫 API 寫入不完整的內容並發佈，yujun 前台讀到時會回 500。要更嚴格的話，需要在 Python 重寫一份欄位規則。
- **GEO 的 classic 表單輸入框沒有框線**：`rounded-xl border-slate-300` 少了 `border`。yujun 的表單有加，所以兩邊外觀略有差異。這是 GEO 現有問題，要不要修另外決定。
- **沒有連過真的 GEO 後端**：`migration.sql`、`import_yujun.py` 只做過語法檢查；編輯器走的是 `src/app/api/v1/` 的模擬 API。

## 不要搬進 GEO 的檔案

`src/app/(editor)/`、`src/app/api/v1/`、`src/lib/dev-pages.ts` 是在這裡跑 GEO 編輯頁用的開發環境。`src/components/blocks/`、`src/components/editor/`、`src/components/ui/Modal.tsx`、`src/lib/api.ts` 是 GEO 檔案的副本（`api.ts` 只改了預設網址），GEO 本來就有。

## 注意事項

- 要改編輯器時，GEO 的三個檔案只動擴充點；改完要重新產生 `geo/patches/01-editor-core.patch`。yujun 專屬的東西一律放 `components/templates/yujun/`。
- 不要在前台加 Tailwind 的全域樣式（preflight），它會改變畫面。Tailwind 只在 `(editor)` 使用。
