import Link from "next/link";
import { pagePath, type ServicePage, type Site } from "@/lib/site";

export default function SiteFooter({ site, services }: { site: Site; services: ServicePage[] }) {
  return (
    <>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <p className="footer-logo">{site.name}</p>
            <p>{site.tagline}</p>
            <address>
              <a href={site.mapUrl} target="_blank" rel="noopener">{site.address.full}</a><br />
              電話：<a href={`tel:${site.phoneIntl}`}>{site.phone}</a>
            </address>
            <p className="social">
              <a href={site.line} target="_blank" rel="noopener">LINE</a>
              <a href={site.facebook} target="_blank" rel="noopener">Facebook</a>
            </p>
          </div>
          <div>
            <p className="footer-h">服務項目</p>
            <ul>{services.map((s) => <li key={s.slug}><Link href={pagePath(s.slug)}>{s.title}</Link></li>)}</ul>
          </div>
          <div>
            <p className="footer-h">網站導覽</p>
            <ul>
              {site.nav.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
              <li><Link href="/contact/">聯絡我們</Link></li>
            </ul>
          </div>
        </div>
        <p className="copy">© {new Date().getFullYear()} {site.name}・服務地區：{site.areaText}</p>
      </footer>

      <div className="float-btns">
        <a href={site.line} target="_blank" rel="noopener" className="float-line">LINE 諮詢</a>
        <a href={`tel:${site.phoneIntl}`} className="float-tel">撥打電話</a>
      </div>
    </>
  );
}
