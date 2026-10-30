import Link from "next/link";
import { SITE, NAV } from "@/data/site";
import { SERVICES } from "@/data/services";

export default function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <p className="footer-logo">{SITE.name}</p>
            <p>{SITE.tagline}</p>
            <address>
              <a href={SITE.mapUrl} target="_blank" rel="noopener">{SITE.address.full}</a><br />
              電話：<a href={`tel:${SITE.phoneIntl}`}>{SITE.phone}</a>
            </address>
            <p className="social">
              <a href={SITE.line} target="_blank" rel="noopener">LINE</a>
              <a href={SITE.facebook} target="_blank" rel="noopener">Facebook</a>
            </p>
          </div>
          <div>
            <p className="footer-h">服務項目</p>
            <ul>{SERVICES.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}/`}>{s.keyword}</Link></li>)}</ul>
          </div>
          <div>
            <p className="footer-h">網站導覽</p>
            <ul>
              {NAV.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
              <li><Link href="/contact/">聯絡我們</Link></li>
            </ul>
          </div>
        </div>
        <p className="copy">© {new Date().getFullYear()} {SITE.name}・服務地區：桃園、中壢及周邊地區</p>
      </footer>

      <div className="float-btns">
        <a href={SITE.line} target="_blank" rel="noopener" className="float-line">LINE 諮詢</a>
        <a href={`tel:${SITE.phoneIntl}`} className="float-tel">撥打電話</a>
      </div>
    </>
  );
}
