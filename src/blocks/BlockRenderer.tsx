// yujun 類型的 block 渲染。介面沿用 GEO BlockRenderer 的形式（blocks + 品牌資料），
// 動態 block（磚格、文章列表、延伸閱讀…）從 ctx 的頁面與文章清單取資料
import { Fragment } from "react";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import Mosaic from "@/components/Mosaic";
import TileGrid, { type Tile } from "@/components/TileGrid";
import FaqList from "@/components/FaqList";
import ContactCta from "@/components/ContactCta";
import Img from "@/components/Img";
import { pagePath } from "@/lib/content";
import { isCasePage, isServicePage, serviceKey, type Site } from "@/lib/site";
import type { Page, Post } from "@/content/types";
import type { Block, BlockData, Faq, MosaicItem } from "./types";

export interface BlockContext {
  site: Site;
  page: Page;
  pages: Page[];
  posts: Post[];
}

export default function BlockRenderer({ blocks, ctx }: { blocks: Block[]; ctx: BlockContext }) {
  return blocks.map((block) => <Fragment key={block.id}>{renderBlock(block, ctx)}</Fragment>);
}

function SecTitle({ heading, sub, as: H = "h2" }: { heading?: string; sub?: string; as?: "h1" | "h2" }) {
  if (!heading) return null;
  return <H className="sec-title">{heading}{sub && <span>{sub}</span>}</H>;
}

const sectionClass = (base: string, background?: "alt") => (background === "alt" ? `${base} alt` : base);
const date = (iso: string | null) => (iso ?? "").slice(0, 10);

// ── 資料選取（也給 JSON-LD 使用）

export const servicePages = (ctx: BlockContext) => ctx.pages.filter(isServicePage);
export const casePages = (ctx: BlockContext) => ctx.pages.filter(isCasePage);

function serviceTiles(ctx: BlockContext): Tile[] {
  return servicePages(ctx).map((s) => ({ image: s.meta.hero, title: s.meta.short, sub: s.meta.en, href: pagePath(s.slug) }));
}

function caseTiles(ctx: BlockContext, sub?: string): Tile[] {
  return casePages(ctx).map((c) => ({ image: c.meta.cover, title: c.title, sub: sub ?? c.meta.type, href: pagePath(c.slug) }));
}

export function faqItems(d: BlockData["faq"], ctx: BlockContext): Faq[] {
  let items = d.items ?? [];
  if (d.from) {
    const source = ctx.pages.find((p) => p.slug === d.from);
    const block = source?.content.find((b) => b.type === "faq" && !b.data.from);
    items = block?.type === "faq" ? block.data.items ?? [] : [];
  }
  return d.limit ? items.slice(0, d.limit) : items;
}

export function serviceFaqs(ctx: BlockContext) {
  return servicePages(ctx).map((s) => {
    const block = s.content.find((b) => b.type === "faq");
    return { page: s, items: block?.type === "faq" ? faqItems(block.data, ctx) : [] };
  });
}

/** 頁面上所有看得到的問答，用來產生 FAQPage 結構化資料 */
export function pageFaqs(ctx: BlockContext): Faq[] {
  return ctx.page.content.flatMap((b) => {
    if (b.type === "faq") return faqItems(b.data, ctx);
    if (b.type === "faq_by_service") return serviceFaqs(ctx).flatMap((s) => s.items);
    return [];
  });
}

function renderBlock(block: Block, ctx: BlockContext) {
  const { site, page } = ctx;
  switch (block.type) {
    case "hero_slider": {
      const d = block.data;
      return <HeroSlider slides={d.slides} title={d.title} subtitle={d.subtitle || undefined} cta={d.cta} />;
    }

    case "intro": {
      const d = block.data;
      return (
        <section className="section tight">
          <div className="wrap intro">
            <SecTitle heading={d.heading} sub={d.sub} />
            <p className="lead">{d.text}</p>
          </div>
        </section>
      );
    }

    case "page_title": {
      const d = block.data;
      const lines = d.lead?.split("\n") ?? [];
      return (
        <section className="section tight">
          <div className={d.align === "center" ? "wrap narrow center" : "wrap narrow"}>
            <SecTitle as="h1" heading={d.title} sub={d.sub} />
            {d.lead && (
              <p className="lead">
                {lines.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{l}</Fragment>)}
              </p>
            )}
          </div>
        </section>
      );
    }

    case "mosaic": {
      const d = block.data;
      const items: MosaicItem[] =
        d.source === "services"
          ? servicePages(ctx).map((s) => ({ heading: s.title, body: s.meta.summary, image_url: s.meta.hero, href: pagePath(s.slug) }))
          : d.items ?? [];
      const mosaic = <Mosaic items={items} numbered={d.numbered ?? true} headingLevel={d.heading_level} />;
      if (!d.heading) return mosaic;
      return (
        <section className="section">
          <div className="wrap">
            <SecTitle heading={d.heading} sub={d.sub} />
          </div>
          {mosaic}
        </section>
      );
    }

    case "tile_grid": {
      const d = block.data;
      const all = d.source === "services" ? serviceTiles(ctx) : caseTiles(ctx);
      const grid = <TileGrid cols={d.cols} intro={d.intro} items={d.limit ? all.slice(0, d.limit) : all} />;
      if (!d.heading) return grid;
      return (
        <section className={sectionClass("section", d.background)}>
          <div className="wrap">
            <SecTitle heading={d.heading} sub={d.sub} />
          </div>
          {grid}
        </section>
      );
    }

    case "note":
      return (
        <div className="note">
          <h2>{block.data.heading}</h2>
          <p>{block.data.body}</p>
        </div>
      );

    case "steps": {
      const d = block.data;
      return (
        <section className="section">
          <div className="wrap">
            <SecTitle heading={d.heading} sub={d.sub} />
            <ol className="steps">
              {d.items.map((s, i) => <li key={i}><b>{String(i + 1).padStart(2, "0")}</b>{s}</li>)}
            </ol>
            {d.text && <p className="center muted">{d.text}</p>}
            {d.link && <p className="center"><Link className="more" href={d.link.href}>{d.link.label} →</Link></p>}
          </div>
        </section>
      );
    }

    case "post_list": {
      const d = block.data;
      const sorted = [...ctx.posts].sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
      const list = d.limit ? sorted.slice(0, d.limit) : sorted;
      const isH1 = d.heading_tag === "h1";
      return (
        <section className={sectionClass("section", d.background)}>
          <div className="wrap">
            <SecTitle as={isH1 ? "h1" : "h2"} heading={d.heading} sub={d.sub} />
            <div className="cards">
              {list.map((p) => (
                <Link key={p.slug} className="card" href={`/blog/${p.slug}/`}>
                  <Img src={p.meta.cover} alt={p.title} sizes="(max-width: 640px) 100vw, 33vw" />
                  <time dateTime={date(p.updated_at)}>{date(p.updated_at)}</time>
                  {isH1 ? <h2 style={{ fontSize: "1.05rem", margin: "14px 0 6px" }}>{p.title}</h2> : <h3>{p.title}</h3>}
                  <p>{p.excerpt}</p>
                </Link>
              ))}
            </div>
            {d.more && <p className="center" style={{ marginTop: 32 }}><Link className="more" href={d.more.href}>{d.more.label} →</Link></p>}
          </div>
        </section>
      );
    }

    case "faq":
      return <FaqList faqs={faqItems(block.data, ctx)} heading={block.data.heading || undefined} />;

    case "faq_by_service":
      return serviceFaqs(ctx).map(({ page: s, items }) => (
        <section key={s.slug} className="section tight faq">
          <div className="wrap narrow">
            <h2 style={{ fontSize: "1.2rem" }}><Link href={pagePath(s.slug)}>{s.title}</Link></h2>
            {items.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ));

    case "related_reading": {
      const d = block.data;
      const key = serviceKey(page);
      const post = ctx.posts.find((p) => p.meta.service === key);
      const cases = casePages(ctx).filter((c) => c.meta.services.includes(key));
      if (!post && cases.length === 0) return null;
      return (
        <section className="section alt">
          <div className="wrap">
            <SecTitle heading={d.heading} sub={d.sub} />
          </div>
          <TileGrid
            cols={3}
            intro={post && { heading: post.title, body: post.excerpt ?? "", href: `/blog/${post.slug}/`, link: "閱讀文章" }}
            items={cases.map((c) => ({ image: c.meta.cover, title: c.title, sub: "工程實績", href: pagePath(c.slug) }))}
          />
        </section>
      );
    }

    case "related_services": {
      if (!isCasePage(page)) return null;
      const services = page.meta.services
        .map((key) => servicePages(ctx).find((s) => serviceKey(s) === key))
        .filter((s) => s !== undefined);
      return (
        <div className="note">
          <h2>{block.data.heading}</h2>
          <p>
            {services.map((s, i) => (
              <Fragment key={s.slug}>{i > 0 && "・"}<Link className="more" href={pagePath(s.slug)}>{s.title}</Link></Fragment>
            ))}
          </p>
        </div>
      );
    }

    case "service_links": {
      const d = block.data;
      const services = servicePages(ctx).filter((s) => !(d.exclude_current && s.slug === page.slug));
      return (
        <section className="section tight">
          <div className="wrap">
            <SecTitle heading={d.heading} sub={d.sub} />
            <ul className="checks" style={{ columns: d.columns, maxWidth: d.max_width, margin: "0 auto" }}>
              {services.map((s) => <li key={s.slug}><Link className="more" href={pagePath(s.slug)}>{s.title}</Link></li>)}
            </ul>
          </div>
        </section>
      );
    }

    case "case_links": {
      const d = block.data;
      const cases = casePages(ctx).filter((c) => !(d.exclude_current && c.slug === page.slug));
      return (
        <section className="section tight">
          <div className="wrap narrow">
            <SecTitle heading={d.heading} sub={d.sub} />
            {d.style === "list" ? (
              <ul className="checks">
                {cases.map((c) => <li key={c.slug}><Link className="more" href={pagePath(c.slug)}>{c.title}</Link>：{c.meta.summary}</li>)}
              </ul>
            ) : (
              cases.map((c) => (
                <p key={c.slug}><Link className="more" href={pagePath(c.slug)}><strong>{c.title}</strong></Link>：{c.meta.summary}</p>
              ))
            )}
          </div>
        </section>
      );
    }

    case "rich_section": {
      const d = block.data;
      return (
        <section className={sectionClass("section", d.background)}>
          <div className="wrap narrow">
            <SecTitle heading={d.heading} sub={d.sub} />
            <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: d.html }} />
          </div>
        </section>
      );
    }

    case "company_info": {
      const d = block.data;
      return (
        <section className="section">
          <div className="wrap narrow">
            <SecTitle heading={d.heading} sub={d.sub} />
            <dl className="contact-info" style={{ padding: 0 }}>
              <dt>名稱</dt><dd>{site.name}</dd>
              <dt>地址</dt><dd><a href={site.mapUrl} target="_blank" rel="noopener">{site.address.full}</a></dd>
              <dt>電話</dt><dd><a href={`tel:${site.phoneIntl}`}>{site.phone}</a></dd>
              <dt>服務地區</dt><dd>{site.areaText}</dd>
              <dt>服務項目</dt><dd>{site.workItems.join("、")}</dd>
            </dl>
          </div>
        </section>
      );
    }

    case "contact_panel": {
      const d = block.data;
      return (
        <div className="contact-grid alt">
          <div className="contact-info">
            <h2>{site.name}</h2>
            <dl>
              <dt>電話</dt><dd><a href={`tel:${site.phoneIntl}`}>{site.phone}</a></dd>
              <dt>LINE</dt><dd><a href={site.line} target="_blank" rel="noopener">加入 LINE 私訊</a></dd>
              <dt>Facebook</dt><dd><a href={site.facebook} target="_blank" rel="noopener">粉絲專頁</a></dd>
              <dt>地址</dt><dd><a href={site.mapUrl} target="_blank" rel="noopener">{site.address.full}</a></dd>
              <dt>服務地區</dt><dd>{site.areaText}</dd>
            </dl>
            <h3 style={{ marginTop: 32 }}>{d.checklist_title}</h3>
            <ul className="checks">
              {d.checklist.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <iframe className="map" src={site.mapEmbed} title={`${site.name} 地圖`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      );
    }

    case "contact_cta":
      return <ContactCta site={site} heading={block.data.heading || undefined} />;
  }
}
