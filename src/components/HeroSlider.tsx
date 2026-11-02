"use client";

// 主視覺幻燈片：高度為畫面的 0.5 倍。第一張優先載入（LCP），其餘延遲載入
import Link from "next/link";
import { useEffect, useState } from "react";
import Img from "@/components/Img";

export default function HeroSlider({
  slides,
  title,
  subtitle,
  cta,
}: {
  slides: { image_url: string; alt: string }[];
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
}) {
  const [index, setIndex] = useState(0);
  // 手動切換時遞增，讓自動輪播重新計時
  const [restart, setRestart] = useState(0);
  const count = slides.length;
  // 編輯器預覽時輪播圖可能被刪減，索引要落在範圍內
  const current = count ? index % count : 0;

  useEffect(() => {
    if (count < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((c) => (c + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [count, restart]);

  const go = (i: number) => {
    setIndex((i + count) % count);
    setRestart((r) => r + 1);
  };

  return (
    <section className="hero" aria-roledescription="carousel" aria-label="主視覺">
      <div className="slides">
        {slides.map((s, i) => (
          <div key={i} className={i === current ? "slide is-active" : "slide"} aria-hidden={i === current ? undefined : "true"}>
            <Img
              src={s.image_url}
              alt={s.alt}
              sizes="100vw"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </div>
        ))}
      </div>
      <div className="hero-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {cta && (/^https?:/.test(cta.href)
          ? <a href={cta.href} target="_blank" rel="noopener" className="btn">{cta.label}</a>
          : <Link href={cta.href} className="btn">{cta.label}</Link>)}
      </div>
      {count > 1 && (
        <>
          <button className="slide-nav prev" aria-label="上一張" onClick={() => go(current - 1)}>‹</button>
          <button className="slide-nav next" aria-label="下一張" onClick={() => go(current + 1)}>›</button>
          <div className="dots">
            {slides.map((_, i) => (
              <button key={i} aria-label={`第 ${i + 1} 張`} className={i === current ? "is-active" : undefined} onClick={() => go(i)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
