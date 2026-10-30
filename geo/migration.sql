-- 宥涒（yujun）網站類型：GEO 資料層變更。說明見 GEO-INTEGRATION.md 第 2 節
-- 可重跑。GEO 沒有 Alembic，create_all 不會替既有資料表加欄位，所以用 SQL 手動執行：
--   docker compose -f docker-compose.prod.yml exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB < migration.sql
-- 執行前先依 BACKUP.md 備份。所有新欄位都有預設值或可為空，既有品牌不受影響（一律是 classic）

BEGIN;

-- 品牌：目前顯示哪一種網站類型，以及該類型的全站設定
ALTER TABLE stores ADD COLUMN IF NOT EXISTS site_template VARCHAR NOT NULL DEFAULT 'classic';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS template_settings JSONB;

-- 頁面：屬於哪一種網站類型；同一品牌可同時保有兩種類型的頁面，切換類型時內容都保留
ALTER TABLE pages ADD COLUMN IF NOT EXISTS template VARCHAR NOT NULL DEFAULT 'classic';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta JSONB;

-- slug 改為在同一品牌、同一類型內唯一（兩種類型可以各有一個 about）
DROP INDEX IF EXISTS uix_pages_store_slug;
CREATE UNIQUE INDEX IF NOT EXISTS uix_pages_store_template_slug ON pages (store_id, template, slug);

-- 文章：兩種類型共用；yujun 類型需要的封面、摘要描述、相關服務放在 meta
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta JSONB;

COMMIT;
