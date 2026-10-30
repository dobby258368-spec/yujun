import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import JsonLd from "@/components/JsonLd";
import { img } from "@/lib/images";
import { article } from "@/lib/schema";
import { SITE_URL, ogImageUrl, pageMeta } from "@/lib/seo";
import { getService } from "@/data/services";
import posts from "@/data/posts.json";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export async function generateMetadata({ params }: Params) {
  const p = getPost((await params).slug);
  if (!p) return {};
  return pageMeta({ title: `${p.title}｜宥涒室內裝潢`, description: p.description, path: `/blog/${p.slug}/`, image: p.cover, type: "article" });
}

export default async function BlogPost({ params }: Params) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const svc = getService(p.service)!;
  const others = posts.filter((o) => o.slug !== p.slug).slice(0, 4);

  return (
    <>
      <JsonLd data={[article(SITE_URL, p, ogImageUrl(p.cover))]} />
      <Crumbs items={[{ name: "裝修知識", href: "/blog/" }, { name: p.title, href: `/blog/${p.slug}/` }]} />
      <article className="article">
        <div className="wrap narrow">
          <p className="meta">
            發布 <time dateTime={p.published}>{p.published}</time>・更新 <time dateTime={p.updated}>{p.updated}</time>・宥涒室內裝潢
          </p>
          <h1>{p.title}</h1>
          <figure className="cover">
            <Image src={img(p.cover)} alt={p.title} sizes="(max-width: 800px) 100vw, 800px" loading="eager" fetchPriority="high" />
          </figure>
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />

          <aside className="related">
            <p><strong>相關服務：</strong><Link href={`/services/${svc.slug}/`}>{svc.keyword}</Link></p>
            <p><strong>延伸閱讀：</strong></p>
            <ul>{others.map((o) => <li key={o.slug}><Link href={`/blog/${o.slug}/`}>{o.title}</Link></li>)}</ul>
          </aside>
        </div>
      </article>
      <ContactCta />
    </>
  );
}
