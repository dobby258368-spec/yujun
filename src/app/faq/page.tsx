import Link from "next/link";
import FaqList from "@/components/FaqList";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import JsonLd from "@/components/JsonLd";
import { GENERAL_FAQS } from "@/data/faq";
import { SERVICES } from "@/data/services";
import { faqPage } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "常見問題｜桃園室內裝潢、統包、老屋翻修 Q&A｜宥涒室內裝潢",
  description: "宥涒室內裝潢常見問題：服務地區、統包內容、費用怎麼估、裝修流程、進度回報、老屋與中古屋翻修注意事項、系統櫃與木作怎麼選。",
  path: "/faq/",
});

const all = [...GENERAL_FAQS, ...SERVICES.flatMap((s) => s.faqs)];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[faqPage(all)]} />
      <Crumbs items={[{ name: "常見問題", href: "/faq/" }]} />
      <section className="section tight">
        <div className="wrap narrow">
          <h1 className="sec-title">常見問題<span>FAQ</span></h1>
        </div>
      </section>
      <FaqList faqs={GENERAL_FAQS} heading="一般問題" />
      {SERVICES.map((s) => (
        <section key={s.slug} className="section tight faq">
          <div className="wrap narrow">
            <h2 style={{ fontSize: "1.2rem" }}><Link href={`/services/${s.slug}/`}>{s.keyword}</Link></h2>
            {s.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <ContactCta />
    </>
  );
}
