// 無邊圖片拼接：圖片與白底文字塊零間距交錯。
// 桌機一列兩組（4 格），奇數列左右對調形成棋盤格；平板一列一組、逐組對調；手機圖上文下
import Link from "next/link";
import Image from "next/image";
import { img } from "@/lib/images";
import type { Block } from "@/data/services";

export default function Mosaic({
  blocks,
  numbered = true,
  headingLevel = "h2",
}: {
  blocks: Block[];
  numbered?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  const lastAlone = blocks.length % 2 === 1;
  return (
    <div className="mosaic">
      {blocks.map((b, i) => {
        const cls = ["m-pair"];
        if (Math.floor(i / 2) % 2 === 1) cls.push("rev-desk");
        if (i % 2 === 1) cls.push("rev-tab");
        if (lastAlone && i === blocks.length - 1) cls.push("full");
        return (
          <div key={i} className={cls.join(" ")}>
            <figure className="m-img">
              <Image
                src={img(b.image)}
                alt={b.heading}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
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
