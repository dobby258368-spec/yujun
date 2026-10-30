import Link from "next/link";
import { STORE_SLUG, getStore } from "@/lib/content";

export default async function NotFound() {
  const store = await getStore(STORE_SLUG);
  return (
    <>
      <title>{`找不到頁面｜${store?.name ?? ""}`}</title>
      <meta name="description" content="您要找的頁面不存在。" />
      <section className="section">
        <div className="wrap narrow center">
          <h1 className="sec-title">找不到頁面<span>404</span></h1>
          <p>您要找的頁面不存在或已移動。</p>
          <p><Link className="btn" href="/">回首頁</Link></p>
        </div>
      </section>
    </>
  );
}
