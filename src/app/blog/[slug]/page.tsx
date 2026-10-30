import Link from "next/link";
import { notFound } from "next/navigation";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import Img from "@/components/Img";
import JsonLd from "@/components/JsonLd";
import { STORE_SLUG, getStore, getStorePage, getStorePost, getStorePosts, pagePath } from "@/lib/content";
import { article } from "@/lib/schema";
import { SITE_URL, ogImageUrl, pageMeta } from "@/lib/seo";
import { siteOf } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getStorePosts(STORE_SLUG);
  return posts.map((p) => ({ slug: p.slug }));
}

const date = (iso: string | null) => (iso ?? "").slice(0, 10);

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const [store, p] = await Promise.all([getStore(STORE_SLUG), getStorePost(STORE_SLUG, slug)]);
  if (!store || !p) return {};
  const site = siteOf(store);
  return pageMeta({ title: `${p.title}｜${site.name}`, description: p.meta.description, path: `/blog/${p.slug}/`, image: p.meta.cover, siteName: site.name, type: "article" });
}

export default async function BlogPost({ params }: Params) {
  const { slug } = await params;
  const [store, p, posts, blog] = await Promise.all([
    getStore(STORE_SLUG),
    getStorePost(STORE_SLUG, slug),
    getStorePosts(STORE_SLUG),
    getStorePage(STORE_SLUG, "blog"),
  ]);
  if (!store || !p) notFound();
  const site = siteOf(store);
  const svc = p.meta.service ? await getStorePage(STORE_SLUG, `services/${p.meta.service}`) : null;
  const others = posts.filter((o) => o.slug !== p.slug).slice(0, 4);
  const blogTitle = blog?.title ?? "文章";

  return (
    <>
      <JsonLd
        data={[article(SITE_URL, { title: p.title, description: p.meta.description, path: `/blog/${p.slug}/`, published: date(p.created_at), updated: date(p.updated_at) }, ogImageUrl(p.meta.cover))]}
      />
      <Crumbs items={[{ name: blogTitle, href: "/blog/" }, { name: p.title, href: `/blog/${p.slug}/` }]} />
      <article className="article">
        <div className="wrap narrow">
          <p className="meta">
            發布 <time dateTime={date(p.created_at)}>{date(p.created_at)}</time>・更新 <time dateTime={date(p.updated_at)}>{date(p.updated_at)}</time>・{site.name}
          </p>
          <h1>{p.title}</h1>
          <figure className="cover">
            <Img src={p.meta.cover} alt={p.title} sizes="(max-width: 800px) 100vw, 800px" loading="eager" fetchPriority="high" />
          </figure>
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.html_content ?? "" }} />

          <aside className="related">
            {svc && <p><strong>相關服務：</strong><Link href={pagePath(svc.slug)}>{svc.title}</Link></p>}
            <p><strong>延伸閱讀：</strong></p>
            <ul>{others.map((o) => <li key={o.slug}><Link href={`/blog/${o.slug}/`}>{o.title}</Link></li>)}</ul>
          </aside>
        </div>
      </article>
      <ContactCta site={site} />
    </>
  );
}
