// 無邊圖片磚：可點擊的圖片零間距排列，可在開頭穿插一塊白底說明文字
import Link from "next/link";
import Img from "@/components/Img";

export type Tile = { image: string; title: string; sub?: string; href: string };

export default function TileGrid({
  items,
  intro,
  cols = 4,
}: {
  items: Tile[];
  intro?: { heading: string; body: string; href?: string; link?: string };
  cols?: 3 | 4;
}) {
  return (
    <div className={`tiles cols-${cols}`}>
      {intro && (
        <div className="tile-text">
          <h2>{intro.heading}</h2>
          <p>{intro.body}</p>
          {intro.href && <Link href={intro.href} className="more">{intro.link ?? "了解更多"} →</Link>}
        </div>
      )}
      {items.map((t) => (
        <Link key={t.href} className="tile" href={t.href}>
          <Img src={t.image} alt={t.title} sizes={`(max-width: 640px) 50vw, ${Math.round(100 / cols)}vw`} />
          <span className="tile-label">
            <strong>{t.title}</strong>
            {t.sub && <small>{t.sub}</small>}
          </span>
        </Link>
      ))}
    </div>
  );
}
