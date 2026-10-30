import type { Site } from "@/lib/site";

export default function ContactCta({ site, heading = "有任何裝修想法，都歡迎聊聊" }: { site: Site; heading?: string }) {
  return (
    <section className="cta">
      <div className="wrap">
        <h2>{heading}</h2>
        <p>服務地區：{site.areaText}</p>
        <div className="cta-btns">
          <a href={site.line} target="_blank" rel="noopener" className="btn btn-light">LINE 私訊</a>
          <a href={`tel:${site.phoneIntl}`} className="btn btn-outline">{site.phone}</a>
        </div>
      </div>
    </section>
  );
}
