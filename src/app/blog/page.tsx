import Link from "next/link";
import Image from "next/image";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import { img } from "@/lib/images";
import { pageMeta } from "@/lib/seo";
import posts from "@/data/posts.json";

export const metadata = pageMeta({
  title: "裝修知識｜桃園室內裝潢、老屋翻修、系統櫃文章｜宥涒室內裝潢",
  description: "宥涒室內裝潢整理的裝修知識：裝潢工程規劃與預算、老屋與中古屋翻修重點、新成屋裝潢、統包、室內設計諮詢與系統櫃安裝。",
  path: "/blog/",
});

const list = [...posts].sort((a, b) => b.updated.localeCompare(a.updated));

export default function Blog() {
  return (
    <>
      <Crumbs items={[{ name: "裝修知識", href: "/blog/" }]} />
      <section className="section">
        <div className="wrap">
          <h1 className="sec-title">裝修知識<span>Articles</span></h1>
          <div className="cards">
            {list.map((p) => (
              <Link key={p.slug} className="card" href={`/blog/${p.slug}/`}>
                <Image src={img(p.cover)} alt={p.title} sizes="(max-width: 640px) 100vw, 33vw" />
                <time dateTime={p.updated}>{p.updated}</time>
                <h2 style={{ fontSize: "1.05rem", margin: "14px 0 6px" }}>{p.title}</h2>
                <p>{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ContactCta />
    </>
  );
}
