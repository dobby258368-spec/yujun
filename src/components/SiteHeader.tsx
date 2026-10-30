"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SITE, NAV } from "@/data/site";

export default function SiteHeader() {
  const pathname = usePathname();
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  // 記住在哪一頁打開選單，換頁後自動收起
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="logo" href="/" aria-label={`${SITE.name} 首頁`}>宥涒<span>室內裝潢</span></Link>
        <nav className={open ? "nav is-open" : "nav"} id="nav" aria-label="主選單">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>{n.label}</Link>
          ))}
          <Link href="/contact/" className="btn btn-sm">預約諮詢</Link>
        </nav>
        <button
          className="menu-toggle"
          aria-label="開啟選單"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpenedAt(open ? null : pathname)}
        >
          <span></span>
        </button>
      </div>
    </header>
  );
}
