import HeroSlider from "@/components/HeroSlider";
import Mosaic from "@/components/Mosaic";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import { SITE, WORK_ITEMS } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "關於宥涒室內裝潢｜桃園室內裝修統包團隊",
  description: SITE.description,
  path: "/about/",
});

const values = [
  {
    heading: "重視看不見的基礎工程",
    body: "好的裝修不只要有漂亮的成果，更要重視看不見的基礎工程。從施工規劃到每個細節的落實，堅持做好該做的工序。",
    image: "1251c6f8c0d84591b0dd2a67ec298783.png",
  },
  {
    heading: "溝通清楚，過程透明",
    body: "報價前先說明施工項目與內容，每個階段都與屋主確認後再進行；施工期間透過照片與進度回報，讓裝修過程安心、結果放心。",
    image: "2752554eed1a4fd9a08afff32a313020.png",
  },
  {
    heading: "從生活需求出發",
    body: "好的空間設計，不只是好看的照片，而是每天回到家都覺得舒服。兼顧美感與實用，依照每個家的條件，規劃最適合的空間配置。",
    image: "f5266cb3b649429c9de3da2e7a2ef376.png",
  },
  {
    heading: "整合工班，一個窗口",
    body: "深耕大桃園地區的統包工程團隊，整合各類專業工班，協助您統籌施工流程、掌握工程品質，有問題只需要找一個窗口。",
    image: "b6d0c11001684d13231de8a46a6dce7e.jpg",
  },
];

export default function About() {
  return (
    <>
      <Crumbs items={[{ name: "關於宥涒", href: "/about/" }]} />
      <HeroSlider
        slides={[
          { image: "c43c63ee483141cea9623b06ec1a0d53.png", alt: "宥涒室內裝潢 完工客廳" },
          { image: "64032842f36b48f4a6a6624f08c053cb.png", alt: "宥涒室內裝潢 餐廚空間" },
        ]}
        title="關於宥涒室內裝潢"
        subtitle={SITE.tagline}
      />

      <section className="section tight">
        <div className="wrap intro">
          <p className="lead">家，不只是居住的空間，更是承載幸福與生活品味的所在。從空間規劃、材質挑選到施工細節，我們用心傾聽每一份需求，以專業與細膩的工藝，將理想化為真實。讓美感與實用完美融合，為每個角落注入溫度，打造舒適、耐看又貼近生活的理想居所。</p>
        </div>
      </section>

      <Mosaic blocks={values} />

      <section className="section">
        <div className="wrap narrow">
          <h2 className="sec-title">公司資訊<span>Company</span></h2>
          <dl className="contact-info" style={{ padding: 0 }}>
            <dt>名稱</dt><dd>{SITE.name}</dd>
            <dt>地址</dt><dd><a href={SITE.mapUrl} target="_blank" rel="noopener">{SITE.address.full}</a></dd>
            <dt>電話</dt><dd><a href={`tel:${SITE.phoneIntl}`}>{SITE.phone}</a></dd>
            <dt>服務地區</dt><dd>桃園、中壢及周邊地區</dd>
            <dt>服務項目</dt><dd>{WORK_ITEMS.join("、")}</dd>
          </dl>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
