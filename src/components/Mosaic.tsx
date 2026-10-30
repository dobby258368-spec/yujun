// 無邊圖片拼接：圖片與白底文字塊零間距交錯。
// 桌機一列兩組（4 格），奇數列左右對調形成棋盤格；平板一列一組、逐組對調；手機圖上文下
import Link from "next/link";
import Img from "@/components/Img";
import type { MosaicItem } from "@/components/templates/yujun/types";

export default function Mosaic({
  items,
  numbered = true,
  headingLevel = "h2",
}: {
  items: MosaicItem[];
  numbered?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  const lastAlone = items.length % 2 === 1;
  return (
    <div className="mosaic">
      {items.map((b, i) => {
        const cls = ["m-pair"];
        if (Math.floor(i / 2) % 2 === 1) cls.push("rev-desk");
        if (i % 2 === 1) cls.push("rev-tab");
        if (lastAlone && i === items.length - 1) cls.push("full");
        return (
          <div key={i} className={cls.join(" ")}>
            <figure className="m-img">
              <Img src={b.image_url} alt={b.heading} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
            </figure>
            <div className="m-text">
              {numbered && <span className="m-no">{String(i + 1).padStart(2, "0")}</span>}
              <H>{b.heading}</H>
              <p>{b.body}</p>
              {b.href && <Link className="more" href={b.href} style={{ marginTop: 14 }}>了解{b.heading} →</Link>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
