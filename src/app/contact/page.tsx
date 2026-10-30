import Crumbs from "@/components/Crumbs";
import { SITE } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "聯絡我們｜預約桃園室內裝潢諮詢｜宥涒室內裝潢",
  description: `預約宥涒室內裝潢諮詢：電話 ${SITE.phone}、LINE 私訊，地址${SITE.address.full}。服務桃園、中壢及周邊地區。`,
  path: "/contact/",
});

export default function Contact() {
  return (
    <>
      <Crumbs items={[{ name: "聯絡我們", href: "/contact/" }]} />
      <section className="section tight">
        <div className="wrap narrow center">
          <h1 className="sec-title">聯絡我們<span>Contact</span></h1>
          <p className="lead">新成屋、中古屋、老屋翻修，有任何裝修想法都歡迎聊聊。<br />說明房屋所在地區與大致需求，我們會再與您約時間討論。</p>
        </div>
      </section>

      <div className="contact-grid alt">
        <div className="contact-info">
          <h2>{SITE.name}</h2>
          <dl>
            <dt>電話</dt><dd><a href={`tel:${SITE.phoneIntl}`}>{SITE.phone}</a></dd>
            <dt>LINE</dt><dd><a href={SITE.line} target="_blank" rel="noopener">加入 LINE 私訊</a></dd>
            <dt>Facebook</dt><dd><a href={SITE.facebook} target="_blank" rel="noopener">粉絲專頁</a></dd>
            <dt>地址</dt><dd><a href={SITE.mapUrl} target="_blank" rel="noopener">{SITE.address.full}</a></dd>
            <dt>服務地區</dt><dd>桃園、中壢及周邊地區</dd>
          </dl>
          <h3 style={{ marginTop: 32 }}>諮詢前可以準備的資料</h3>
          <ul className="checks">
            <li>房屋坪數與格局圖（沒有也沒關係）</li>
            <li>現況照片</li>
            <li>喜歡的風格參考圖</li>
            <li>大概的預算範圍與預計入住時間</li>
          </ul>
        </div>
        <iframe className="map" src={SITE.mapEmbed} title={`${SITE.name} 地圖`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </>
  );
}
