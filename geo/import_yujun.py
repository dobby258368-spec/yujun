"""
把宥涒網站（yujun-interior 專案的 content/）匯入 GEO 既有品牌 enjoy-no1，成為 yujun 類型的頁面。
說明見 yujun-interior/geo/GEO-INTEGRATION.md 第 5 節。定案前不要執行。

前置條件：
  1. 已執行 geo/migration.sql
  2. GEO 的 Store、Page、Post model 已加上新欄位（GEO-INTEGRATION.md 第 2 節）
  3. 本檔複製到 GEO-Saas/backend/scripts/import_yujun.py
  4. yujun 的 content/ 與 public/uploads/yujun/ 複製進 backend 容器：
       docker cp yujun-interior/content geo_backend:/tmp/yujun/content
       docker cp yujun-interior/public/uploads/yujun geo_backend:/tmp/yujun/uploads

用法（在 GEO 專案根目錄）：
    # 預設 dry-run：列出會新增或修改哪些頁面、文章、圖片，不寫入
    docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun
    # 確認無誤後實際寫入（品牌仍顯示 classic 版，不影響現有網站）
    docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun --apply
    # 檢查過 yujun 版後，連同切換網站類型
    docker compose -f docker-compose.prod.yml exec backend python -m scripts.import_yujun --apply --switch

- 可以重跑：頁面以 (品牌, yujun, slug) 對應，已存在就更新；圖片已複製過就跳過。
- classic 類型的頁面一律不動；不加 --switch 時品牌仍顯示 classic 版。
- 文章兩種類型共用：先用 slug、再用標題對應 enjoy-no1 既有文章，對上的只補 meta（內文不動，
  加 --update-posts 才覆寫內文）；對不上的才新增。
- 圖片複製到 uploads/img/yujun-<原檔名>，內容裡的 /uploads/yujun/... 改寫成 {BASE_URL}/uploads/img/yujun-...
"""
import asyncio
import json
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from markdownify import markdownify as md
from sqlalchemy import and_, select

import app.models  # noqa: F401  確保所有 model 都已註冊
from app.core.config import settings
from app.core.database import AsyncSessionLocal, engine
from app.models.page import Page
from app.models.post import Post
from app.models.store import Store
from app.utils.frontend_cache import revalidate_store_pages

STORE_SLUG = "enjoy-no1"
TEMPLATE = "yujun"


def arg(name: str, default: str) -> str:
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


CONTENT_DIR = Path(arg("--content", "/tmp/yujun/content"))
UPLOADS_SRC = Path(arg("--uploads", "/tmp/yujun/uploads"))
UPLOADS_DST = Path("uploads/img")
LOCAL_PREFIX = "/uploads/yujun/"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


class Report:
    def __init__(self) -> None:
        self.count = 0

    def add(self, kind: str, message: str) -> None:
        self.count += 1
        print(f"  [{kind}] {message}")


def rewrite_images(value: Any, used: set[str]) -> Any:
    """把內容裡所有 /uploads/yujun/<檔名> 換成 GEO 的圖片網址，並記下用到的檔案"""
    if isinstance(value, str) and value.startswith(LOCAL_PREFIX):
        name = value[len(LOCAL_PREFIX):]
        used.add(name)
        return f"{settings.BASE_URL}/uploads/img/yujun-{name}"
    if isinstance(value, list):
        return [rewrite_images(v, used) for v in value]
    if isinstance(value, dict):
        return {k: rewrite_images(v, used) for k, v in value.items()}
    return value


def copy_images(names: set[str], apply: bool, r: Report) -> None:
    for name in sorted(names):
        src, dst = UPLOADS_SRC / name, UPLOADS_DST / f"yujun-{name}"
        if dst.exists():
            continue
        if not src.exists():
            raise SystemExit(f"找不到圖片：{src}")
        r.add("圖片", f"{name} → {dst}")
        if apply:
            UPLOADS_DST.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)


async def import_store(db, store: Store, data: dict, switch: bool, r: Report) -> None:
    if store.template_settings != data["template_settings"]:
        r.add("品牌", "template_settings（yujun 全站設定）")
        store.template_settings = data["template_settings"]
    # 只補空白欄位，不覆寫 classic 版已經在用的資料
    if not store.description and data.get("description"):
        r.add("品牌", "description（原本空白）")
        store.description = data["description"]
    for field in ("contact_info", "social_links"):
        current = dict(getattr(store, field) or {})
        missing = {k: v for k, v in (data.get(field) or {}).items() if v and not current.get(k)}
        if missing:
            r.add("品牌", f"{field} 補上 {', '.join(missing)}")
            setattr(store, field, {**current, **missing})
    if switch and store.site_template != TEMPLATE:
        r.add("品牌", f"site_template：{store.site_template} → {TEMPLATE}")
        store.site_template = TEMPLATE


async def import_pages(db, store: Store, pages: list[dict], r: Report) -> None:
    existing = {
        p.slug: p
        for p in (await db.execute(select(Page).where(and_(Page.store_id == store.id, Page.template == TEMPLATE)))).scalars()
    }
    for data in pages:
        fields = {
            "title": data["title"],
            "content": data["content"],
            "seo_title": data.get("seo_title"),
            "seo_description": data.get("seo_description"),
            "meta": data.get("meta"),
            "sort_order": data["sort_order"],
            "is_published": data["is_published"],
        }
        page = existing.get(data["slug"])
        if page is None:
            r.add("新增頁面", f"{data['slug']}（{data['title']}）")
            db.add(Page(store_id=store.id, template=TEMPLATE, slug=data["slug"], **fields))
            continue
        changed = [k for k, v in fields.items() if getattr(page, k) != v]
        if changed:
            r.add("更新頁面", f"{data['slug']}：{', '.join(changed)}")
            for k in changed:
                setattr(page, k, fields[k])


async def import_posts(db, store: Store, posts: list[dict], update_html: bool, r: Report) -> None:
    current = list((await db.execute(select(Post).where(and_(Post.store_id == store.id, Post.deleted_at.is_(None))))).scalars())
    by_slug = {p.slug: p for p in current}
    by_title = {p.title.strip(): p for p in current}
    for data in posts:
        post = by_slug.get(data["slug"]) or by_title.get(data["title"].strip())
        if post is None:
            r.add("新增文章", f"{data['slug']}（{data['title']}）")
            db.add(Post(
                store_id=store.id,
                slug=data["slug"],
                title=data["title"],
                status=data["status"],
                html_content=data["html_content"],
                markdown_content=md(data["html_content"] or ""),
                meta=data["meta"],
                created_at=datetime.fromisoformat(data["created_at"]),
            ))
            continue
        how = "slug" if post.slug == data["slug"] else f"標題（GEO slug：{post.slug}）"
        if post.meta != data["meta"]:
            r.add("文章 meta", f"{data['title']} ← 以{how}對應")
            post.meta = data["meta"]
        if update_html and post.html_content != data["html_content"]:
            r.add("文章內文", f"{data['title']} 覆寫內文")
            post.html_content = data["html_content"]
            post.markdown_content = md(data["html_content"] or "")


async def main() -> None:
    apply = "--apply" in sys.argv
    switch = "--switch" in sys.argv
    update_html = "--update-posts" in sys.argv

    for model, column in ((Store, "template_settings"), (Page, "template"), (Page, "meta"), (Post, "meta")):
        if not hasattr(model, column):
            raise SystemExit(f"{model.__name__} model 缺少 {column} 欄位，請先依 GEO-INTEGRATION.md 第 2 節修改 model")

    used: set[str] = set()
    store_data = rewrite_images(load(CONTENT_DIR / "store.json"), used)
    pages = [rewrite_images(load(f), used) for f in sorted((CONTENT_DIR / "pages").glob("*.json"))]
    posts = [rewrite_images(load(f), used) for f in sorted((CONTENT_DIR / "posts").glob("*.json"))]

    r = Report()
    async with AsyncSessionLocal() as db:
        store = (await db.execute(select(Store).where(and_(Store.slug == STORE_SLUG, Store.deleted_at.is_(None))))).scalar_one_or_none()
        if store is None:
            raise SystemExit(f"找不到品牌 {STORE_SLUG}")
        print(f"品牌：{store.brand_name}（{store.slug}），目前網站類型：{store.site_template}\n")

        copy_images(used, apply, r)
        await import_store(db, store, store_data, switch, r)
        await import_pages(db, store, pages, r)
        await import_posts(db, store, posts, update_html, r)

        if not apply:
            await db.rollback()
            print(f"\ndry-run：共 {r.count} 項修改，沒有寫入。確認無誤後加 --apply 執行。")
        else:
            await db.commit()
            await revalidate_store_pages(store.slug)
            print(f"\n已寫入 {r.count} 項修改。")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
