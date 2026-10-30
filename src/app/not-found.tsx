import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "找不到頁面｜宥涒室內裝潢",
  description: "您要找的頁面不存在。",
  path: "/404/",
});

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap narrow center">
        <h1 className="sec-title">找不到頁面<span>404</span></h1>
        <p>您要找的頁面不存在或已移動。</p>
        <p><Link className="btn" href="/">回首頁</Link></p>
      </div>
    </section>
  );
}
