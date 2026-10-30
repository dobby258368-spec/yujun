import Link from "next/link";
import { notFound } from "next/navigation";
import HeroSlider from "@/components/HeroSlider";
import Mosaic from "@/components/Mosaic";
import FaqList from "@/components/FaqList";
import ContactCta from "@/components/ContactCta";
import TileGrid from "@/components/TileGrid";
import Crumbs from "@/components/Crumbs";
import JsonLd from "@/components/JsonLd";
import { SERVICES, getService } from "@/data/services";
import { CASES } from "@/data/cases";
import { faqPage, service as serviceLd } from "@/lib/schema";
import { SITE_URL, ogImageUrl, pageMeta } from "@/lib/seo";
import posts from "@/data/posts.json";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params) {
  const s = getService((await params).slug);
  if (!s) return {};
  return pageMeta({ title: s.seoTitle, description: s.seoDescription, path: `/services/${s.slug}/`, image: s.hero });
}

export default async function ServicePage({ params }: Params) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const post = posts.find((p) => p.service === s.slug);
  const cases = CASES.filter((c) => c.services.includes(s.slug));
  const others = SERVICES.filter((o) => o.slug !== s.slug);
  const slides = [{ image: s.hero, alt: s.keyword }, ...s.blocks.slice(0, 3).map((b) => ({ image: b.image, alt: b.heading }))]
    .filter((x, i, arr) => arr.findIndex((y) => y.image === x.image) === i);

  return (
    <>
      <JsonLd data={[serviceLd(SITE_URL, s, ogImageUrl(s.hero)), faqPage(s.faqs)]} />
      <Crumbs items={[{ name: "服務項目", href: "/services/" }, { name: s.keyword, href: `/services/${s.slug}/` }]} />
      <HeroSlider slides={slides} title={s.keyword} subtitle={s.lead} cta={{ href: "/contact/", label: "預約諮詢" }} />

      <section className="section tight">
        <div className="wrap intro">
          <p className="lead">{s.intro}</p>
        </div>
      </section>

      <Mosaic blocks={s.blocks} />

      {s.note && (
        <div className="note">
          <h2>{s.note.heading}</h2>
          <p>{s.note.body}</p>
        </div>
      )}

      <FaqList faqs={s.faqs} heading={`${s.keyword}常見問題`} />

      {(post || cases.length > 0) && (
        <section className="section alt">
          <div className="wrap">
            <h2 className="sec-title">延伸閱讀<span>Read More</span></h2>
          </div>
          <TileGrid
            cols={3}
            intro={post && { heading: post.title, body: post.excerpt, href: `/blog/${post.slug}/`, link: "閱讀文章" }}
            items={cases.map((c) => ({ image: c.cover, title: c.title, sub: "工程實績", href: `/cases/${c.slug}/` }))}
          />
        </section>
      )}

      <section className="section tight">
        <div className="wrap">
          <h2 className="sec-title">其他服務<span>Services</span></h2>
          <ul className="checks" style={{ columns: 3, maxWidth: 900, margin: "0 auto" }}>
            {others.map((o) => <li key={o.slug}><Link className="more" href={`/services/${o.slug}/`}>{o.keyword}</Link></li>)}
          </ul>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
