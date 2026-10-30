import Link from "next/link";
import { Fragment } from "react";
import JsonLd from "@/components/JsonLd";
import { breadcrumb } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";

// 麵包屑與對應的 BreadcrumbList 結構化資料
export default function Crumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <>
      <JsonLd data={[breadcrumb(SITE_URL, [{ name: "首頁", href: "/" }, ...items])]} />
      <nav className="crumbs wrap" aria-label="麵包屑">
        <Link href="/">首頁</Link>
        {items.map((b, i) => (
          <Fragment key={b.href}>
            <span aria-hidden="true">/</span>
            {i === items.length - 1 ? <span aria-current="page">{b.name}</span> : <Link href={b.href}>{b.name}</Link>}
          </Fragment>
        ))}
      </nav>
    </>
  );
}
