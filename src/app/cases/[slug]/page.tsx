import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import HeroSlider from "@/components/HeroSlider";
import Mosaic from "@/components/Mosaic";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import { CASES, getCase } from "@/data/cases";
import { getService } from "@/data/services";
import { pageMeta } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params) {
  const c = getCase((await params).slug);
  if (!c) return {};
  return pageMeta({ title: `${c.title}｜${c.type}實績｜宥涒室內裝潢`, description: c.summary, path: `/cases/${c.slug}/`, image: c.cover });
}

export default async function CasePage({ params }: Params) {
  const c = getCase((await params).slug);
  if (!c) notFound();
  const services = c.services.map(getService).filter((s) => s !== undefined);
  const others = CASES.filter((o) => o.slug !== c.slug);

  return (
    <>
      <Crumbs items={[{ name: "工程實績", href: "/cases/" }, { name: c.title, href: `/cases/${c.slug}/` }]} />
      <HeroSlider slides={c.blocks.map((b) => ({ image: b.image, alt: `${c.title}・${b.heading}` }))} title={c.title} subtitle={c.type} />

      <section className="section tight">
        <div className="wrap intro">
          <p className="lead">{c.summary}</p>
        </div>
      </section>

      <Mosaic blocks={c.blocks} />

      <div className="note">
        <h2>相關服務</h2>
        <p>
          {services.map((s, i) => (
            <Fragment key={s.slug}>{i > 0 && "・"}<Link className="more" href={`/services/${s.slug}/`}>{s.keyword}</Link></Fragment>
          ))}
        </p>
      </div>

      <section className="section tight">
        <div className="wrap narrow">
          <h2 className="sec-title">其他實績<span>More Projects</span></h2>
          <ul className="checks">
            {others.map((o) => <li key={o.slug}><Link className="more" href={`/cases/${o.slug}/`}>{o.title}</Link>：{o.summary}</li>)}
          </ul>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
