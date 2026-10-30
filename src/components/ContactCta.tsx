import { SITE } from "@/data/site";

export default function ContactCta({ heading = "有任何裝修想法，都歡迎聊聊" }: { heading?: string }) {
  return (
    <section className="cta">
      <div className="wrap">
        <h2>{heading}</h2>
        <p>服務地區：桃園、中壢及周邊地區</p>
        <div className="cta-btns">
          <a href={SITE.line} target="_blank" rel="noopener" className="btn btn-light">LINE 私訊</a>
          <a href={`tel:${SITE.phoneIntl}`} className="btn btn-outline">{SITE.phone}</a>
        </div>
      </div>
    </section>
  );
}
