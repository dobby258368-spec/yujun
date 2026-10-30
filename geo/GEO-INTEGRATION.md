# 宥涒網站搬進 GEO：整合規格

> 對象：定案後負責在 GEO-Saas 實作的人。
> 對照版本：GEO-Saas commit `00373bc`。動工前先比對 GEO 在那之後的改動（特別是 `backend/app/api/public.py`、`pages.py`、`posts.py`、`frontend/src/components/blocks/`）。
> 本資料夾的檔案（`migration.sql`、`import_yujun.py`）只是準備好的草稿，**定案前不要複製進 GEO，也不要執行**。

## 1. 背景

- 宥涒室內裝潢在 GEO 上就是品牌 **`enjoy-no1`**（10 個服務頁、10 篇文章，classic 類型）。yujun 專案的文案也是從這個品牌整理出來的。
- 目標：品牌多一個「網站類型」。`enjoy-no1` 可以在 classic（現行版）和 yujun（新版）之間切換，**兩種版本的頁面都保留**；文章兩種類型共用。
- 兩種類型的編輯元件完全分開。classic 的程式與資料都不改，只補上「類型 = classic」。
- 不論走融合還是獨立，內容都存在 GEO、在 GEO 後台編輯，yujun 前台讀 GEO 公開 API。差別只在前台由誰渲染（見第 3、4 節）。

## 2. 兩條路都要做的 GEO 變更

### 2.1 資料庫（`migration.sql`）

| 資料表 | 欄位 | 說明 |
|---|---|---|
| `stores` | `site_template VARCHAR NOT NULL DEFAULT 'classic'` | 目前顯示的網站類型 |
| `stores` | `template_settings JSONB` | yujun 類型的全站設定，格式見 yujun 的 `src/content/types.ts` → `TemplateSettings` |
| `pages` | `template VARCHAR NOT NULL DEFAULT 'classic'` | 頁面屬於哪一種類型 |
| `pages` | `meta JSONB` | 服務頁、案例頁的結構化資料（`ServiceMeta`、`CaseMeta`），其他頁面為 null |
| `pages` | 唯一索引改為 `(store_id, template, slug)` | 兩種類型可以各有同 slug 的頁面 |
| `posts` | `meta JSONB` | `{ cover, description, service }`，classic 不使用 |

GEO 沒有 Alembic，`create_all` 不會替既有資料表加欄位，所以用 SQL 手動執行（可重跑）。執行前依 `BACKUP.md` 備份。

### 2.2 Model

- `Store`：加 `site_template: Mapped[str]`（預設 `"classic"`）、`template_settings: Mapped[dict | None]`（JSONB）。
- `Page`：加 `template: Mapped[str]`（預設 `"classic"`）、`meta: Mapped[dict | None]`；`__table_args__` 的唯一索引改為 `uix_pages_store_template_slug (store_id, template, slug)`。
- `Post`：加 `meta: Mapped[dict | None]`。

### 2.3 公開 API（`backend/app/api/public.py`）

yujun 前台用的就是這幾支，回應格式的對照在 yujun 的 `src/content/types.ts`，可以用 `scripts/mock-geo-api.mjs` 當參考實作。

| 端點 | 要改的地方 |
|---|---|
| `GET /stores/{slug}` | 回應加 `site_template`、`template_settings` |
| `GET /stores/{slug}/pages` | 只回 `template == store.site_template` 的頁面（classic 品牌行為不變） |
| `GET /stores/{slug}/pages/{page_slug}` | 路徑改成 `{page_slug:path}`（yujun 的 slug 含 `/`，例如 `services/turnkey`）；同樣依 `site_template` 篩選；回應加 `meta`、`sort_order`、`is_published` |
| `GET /stores/{slug}/posts/{post_slug}` | 回應加 `meta` |
| `GET /stores/{slug}/posts`（建議） | 清單也回 `meta`。不加的話 yujun 前台會逐篇呼叫單篇 API 來拿封面 |
| `GET /stores/{slug}/pages`（建議） | 清單也回 `meta` 與 `content`，或新增 `?full=1`。不加的話 yujun 前台會逐頁呼叫，頁數多時較慢（有快取，可先不改） |

`home` 自動建立首頁的邏輯（`get_public_page` 裡的 initial_blocks）只適用 classic，yujun 類型要跳過。

### 2.4 後台 API（`pages.py`、`posts.py`、`admin.py`）

- `CreatePageRequest` / `UpdatePageRequest` 加 `template`、`meta`。
- slug 規則依類型：classic 維持 `^[a-z0-9]+(?:-[a-z0-9]+)*$`；yujun 允許多段 `^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$`（同 yujun 的 `SLUG_PATTERN`）。
- slug 重複檢查改為同品牌、**同類型**內不重複。
- 頁面清單（後台）依目前編輯的類型篩選。
- 驗證：後端至少檢查每個 block 的 `type` 屬於該類型（yujun 的 type 清單見 `src/blocks/types.ts`）；欄位層級的驗證由前端 `registry.ts` 的 `validatePage` 負責。
- 文章 API（含 admin 的 `/posts/{id}`）加 `meta` 的讀寫。
- 上傳 API 不變。注意它回傳的是**絕對網址** `{BASE_URL}/uploads/img/...`，yujun 前台兩種網址都支援。

### 2.5 後台介面（`frontend/src/app/dashboard/`）

搬進 GEO 前台的檔案（放在 `components/templates/yujun/`，classic 的 `components/blocks/` 不動）：

| yujun 專案 | 用途 |
|---|---|
| `src/blocks/types.ts`、`src/blocks/registry.ts` | block 格式、欄位定義、`validatePage` |
| `src/editor/BlockEditor.tsx`、`src/editor/FieldInput.tsx` | yujun 的區塊編輯器，介面與 GEO 的 `BlockEditor` 相同（`blocks`、`onChange`、`onUploadImage`） |
| `src/editor/Editor.tsx` | 參考用：頁面設定、meta 面板、新頁面預設區塊（`TEMPLATES`）的寫法 |

要做的事：

- `website/[id]` 依 `store.site_template` 選擇 classic 或 yujun 的編輯器。yujun 多一個 meta 面板（`metaFieldsFor(slug)`）；`html` 欄位改用 GEO 既有的 `TraditionalEditor`。
- 品牌設定（`admin/brands/[storeId]`）加「網站類型」：建立時選擇，之後可切換；切換前提醒目標類型有沒有頁面，並提供預覽（見 2.6）。
- 文章編輯頁在 yujun 類型時多三個欄位：封面、摘要描述、相關服務。

### 2.6 預覽與快取

- 切換前預覽：管理員可用 `?preview_template=yujun` 看另一種類型（需驗證身分，且不可被快取）。
- `backend/app/utils/frontend_cache.py` 的 `revalidate_store_pages`：融合時 GEO 前台自己處理；獨立時要多呼叫 yujun 容器的 `/api/revalidate/`（**結尾要有斜線**，否則會先回 308，httpx 預設不跟隨轉址），別台機器時帶 `x-revalidate-secret` 標頭。

## 3. 只有融合要做

1. GEO 前台現有的根 layout、`[storeSlug]`、`dashboard` 等移進 `app/(platform)/`，程式不改。
2. 新增 `app/(tpl-yujun)/`，內容來自 yujun 的 `src/app/(site)/`、`src/components/`、`src/blocks/BlockRenderer.tsx`、`src/styles/global.css`。它有自己的根 layout 和 CSS，不會載入 GEO 的 `globals.css` 與 Tailwind。
3. yujun 的 `src/lib/content.ts` 換成 GEO 的 `lib/store-data.ts`。函式介面相同（`getStore`、`getStorePages`、`getStorePage`、`getStorePosts`、`getStorePost`），差在 yujun 版會回傳完整內容（含 meta）。
4. middleware 依品牌的 `site_template`（快取，配合 revalidate 失效）把 `/{storeSlug}/...` 內部改寫到 `(tpl-yujun)`。
5. 自訂網域：`Store` 加 `custom_domain`；middleware 依 Host 對應品牌；canonical、sitemap、llms.txt 用該網域；nginx 加 server 區塊與憑證（範例 `deploy/nginx.geo-host.conf` 的寫法可沿用）。
6. AI 爬蟲追蹤的 middleware 目前用網址第一段判斷品牌，自訂網域下要改用 Host 對應。
7. 回歸測試：classic 品牌（億鑫、豐泰、enjoy-no1 等）每一頁都不能變。

## 4. 只有獨立要做

1. 依 `deploy/README.md` 部署 yujun 容器（`CONTENT_SOURCE=api`），放在 GEO 正式機或另一台 VM。
2. `revalidate_store_pages` 對 `enjoy-no1` 額外呼叫 yujun 的 `/api/revalidate/`（見 2.6）。
3. nginx 與憑證：`deploy/nginx.geo-host.conf` 或 `deploy/nginx.standalone.conf`。
4. AI 爬蟲追蹤：yujun 不經過 GEO 的 middleware。改由 celery 定期讀 yujun 的 nginx log，篩出 AI 爬蟲的 User-Agent，寫進 `AICrawlerLog`。
5. 環境變數 `NEXT_PUBLIC_GEO_PUBLIC_URL` 設成 GEO 的 `BASE_URL`，next/image 才允許從 GEO 取圖。

## 5. 匯入宥涒內容（`import_yujun.py`）

前置：2.1、2.2 完成。

```bash
# 1. 腳本與內容放進 GEO
cp yujun-interior/geo/import_yujun.py GEO-Saas/backend/scripts/
docker cp yujun-interior/content geo_backend:/tmp/yujun/content
docker cp yujun-interior/public/uploads/yujun geo_backend:/tmp/yujun/uploads

# 2. dry-run，檢查會改什麼
docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun

# 3. 寫入（品牌仍顯示 classic 版）
docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun --apply

# 4. 用 ?preview_template=yujun 檢查後，再切換
docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun --apply --switch
```

- 頁面：在 `enjoy-no1` 下建立 22 個 yujun 類型頁面，classic 頁面不動。
- 圖片：複製到 `uploads/img/yujun-<檔名>`，內容裡的網址改寫成 `{BASE_URL}/uploads/img/yujun-...`。
- 品牌：寫入 `template_settings`；description、聯絡方式、社群連結只補空白欄位。
- 文章：先用 slug、再用標題對應既有文章。對上的只補 `meta`（加 `--update-posts` 才覆寫內文），對不上的才新增。dry-run 會列出每篇是用 slug 還是標題對上的。**如果 GEO 上的文章 slug 和 yujun 不同，yujun 網站的文章網址會跟著 GEO**（yujun 網域尚未上線，沒有既有網址要保留）。

## 6. 待決定（影響上面的做法）

- 部署路徑：融合（第 3 節）或獨立（第 4 節）。
- 文章共用（本規格的預設）或兩種類型各自一套。若各自一套，`posts` 也要加 `template` 欄位。
- 宥涒用自己的網域，還是 `geoseo-service.com/enjoy-no1/`（目前 yujun 的網址結構假設是自己的網域，路徑從根目錄開始）。
- 服務頁要不要開放後台編輯（目前開放）。
