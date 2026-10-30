import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import Mosaic from "@/components/Mosaic";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import { SERVICES } from "@/data/services";
import { WORK_ITEMS } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "服務項目｜桃園室內裝潢、統包、老屋翻修、系統櫃｜宥涒室內裝潢",
  description: "宥涒室內裝潢服務項目：桃園室內裝潢、老屋翻修、室內裝修、裝潢統包、新成屋裝潢、中古屋裝修、室內設計諮詢、裝潢工程規劃、空間設計與系統櫃安裝。",
  path: "/services/",
});

const blocks = SERVICES.map((s) => ({ heading: s.keyword, body: s.intro, image: s.hero, href: `/services/${s.slug}/` }));

export default function Services() {
  return (
    <>
      <Crumbs items={[{ name: "服務項目", href: "/services/" }]} />
      <HeroSlider
        slides={SERVICES.slice(0, 5).map((s) => ({ image: s.hero, alt: s.keyword }))}
        title="服務項目"
        subtitle="一個窗口，從設計到完工全程搞定"
      />

      <section className="section tight">
        <div className="wrap intro">
          <p className="lead">從設計規劃到{WORK_ITEMS.slice(0, 6).join("、")}，宥涒室內裝潢整合各類專業工班，服務桃園、中壢及周邊地區。點選各項服務了解細節。</p>
        </div>
      </section>

      <Mosaic blocks={blocks} />
      <div className="note">
        <h2>找不到您需要的項目？</h2>
        <p>各類室內裝修與修繕工程都歡迎詢問，說明房屋所在地區與大致需求，我們會再與您討論。</p>
      </div>
      <section className="section tight">
        <div className="wrap">
          <ul className="checks" style={{ columns: 2, maxWidth: 720, margin: "0 auto" }}>
            {SERVICES.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}/`} className="more">{s.keyword}</Link></li>)}
          </ul>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
