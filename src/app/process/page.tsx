import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import Mosaic from "@/components/Mosaic";
import ContactCta from "@/components/ContactCta";
import Crumbs from "@/components/Crumbs";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "裝修流程與工序｜從丈量到驗收｜宥涒室內裝潢",
  description: "宥涒室內裝潢的裝修流程：現場丈量、需求討論、設計規劃與報價、確認後開工、施工進度回報、完工驗收；施工依拆除、水電、泥作防水、木作、油漆、系統櫃與燈具順序進行。",
  path: "/process/",
});

// 工序說明（來源：裝潢工程規劃文章與 enjoy-no9 分頁）
const works = [
  {
    heading: "拆除與現場保護",
    body: "確認保留與移除的項目，評估是否涉及結構或公共管線；同時做好公共區域、電梯、走道與既有設備的保護，並確認廢棄物清運方式。",
    image: "54b8f74c691b474f91e2c7093de98f99.png",
  },
  {
    heading: "水電與管線配置",
    body: "依照家具位置、電器設備與生活動線，確認插座、開關、照明迴路與網路配置；老屋會先檢查既有線路與管材，再決定是否更新。",
    image: "12e5e03a10bb44679300dab48be1fbb5.png",
  },
  {
    heading: "泥作與防水",
    body: "浴室、陽台與外牆是防水重點。確認防水範圍與施工方式，從基層處理到防水層施作，完成後安排檢查再進入下一道工序。",
    image: "1251c6f8c0d84591b0dd2a67ec298783.png",
  },
  {
    heading: "木作與系統櫃",
    body: "天花板、電視牆、玄關櫃、衣櫃與書櫃等，依尺寸、開門方向、使用頻率與內部分層規劃，避免過度設置櫃體壓縮走道。",
    image: "20a96af330da2aab68e4774cc8b2d1a3.jpg",
  },
  {
    heading: "油漆、地板與表面裝修",
    body: "基礎工程與木作完成後進行油漆與地板等表面裝修，選材時同時考量耐用度、清潔方式與維護成本，並納入養護時間。",
    image: "1aa27b04310744c4a346ae3bd63f6052.jpg",
  },
  {
    heading: "燈具設備與完工驗收",
    body: "安裝燈具、衛浴、五金與廚房設備並進行功能測試；完工後與屋主逐項檢查開關插座、照明、門片、抽屜、排水與表面施工品質。",
    image: "b0ccb1fbc40a42538a84c7227c1d887d.jpg",
  },
];

export default function Process() {
  return (
    <>
      <Crumbs items={[{ name: "裝修流程", href: "/process/" }]} />
      <HeroSlider
        slides={works.slice(0, 4).map((w) => ({ image: w.image, alt: w.heading }))}
        title="裝修流程"
        subtitle="工序排得好，工程才會順"
      />

      <section className="section">
        <div className="wrap">
          <h2 className="sec-title">合作流程<span>Process</span></h2>
          <ol className="steps">
            <li><b>01</b>現場丈量</li>
            <li><b>02</b>需求討論</li>
            <li><b>03</b>設計規劃與報價</li>
            <li><b>04</b>確認後開工</li>
            <li><b>05</b>施工進度回報</li>
            <li><b>06</b>完工驗收</li>
          </ol>
          <p className="center muted">每個階段都與屋主確認後再進行。報價前先說明施工項目與內容，施工期間以照片回報進度。</p>
        </div>
      </section>

      <div className="note">
        <h2>施工順序</h2>
        <p>拆除 → 水電 → 泥作與防水 → 木作 → 油漆 → 系統櫃與燈具{"\n"}依照正確順序施工，減少重工與等待，工期也更好掌握。實際順序會依房屋類型、設計內容與現場狀況調整。</p>
      </div>

      <Mosaic blocks={works} />

      <section className="section alt">
        <div className="wrap narrow">
          <h2 className="sec-title">預算怎麼規劃<span>Budget</span></h2>
          <p>實際費用會受到坪數、屋況、施工範圍、材料選擇、設備等級與設計複雜度影響，不宜只用單一價格判斷。建議先把預算分成四類，再區分必要工程與選配項目：</p>
          <ul className="checks">
            <li><strong>基礎工程：</strong>拆除、清運、水電、防水、泥作與必要修繕</li>
            <li><strong>裝修工程：</strong>木作、系統櫃、油漆、地板與其他表面施工</li>
            <li><strong>設備與家具：</strong>燈具、衛浴、廚房設備、家電與活動家具</li>
            <li><strong>設計與管理費用：</strong>依委託內容確認設計與工程管理範圍</li>
          </ul>
          <p>詳細說明可參考<Link className="more" href="/blog/construction-planning-guide/">桃園裝潢工程規劃｜掌握施工流程與預算配置</Link>。</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap narrow">
          <h2 className="sec-title">諮詢前可以準備的資料<span>Before Consultation</span></h2>
          <ul className="checks">
            <li>房屋坪數與格局圖（沒有也沒關係）</li>
            <li>現況照片</li>
            <li>喜歡的風格參考圖</li>
            <li>大概的預算範圍與預計入住時間</li>
          </ul>
          <p className="muted">資料越完整，討論起來越有效率。</p>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
