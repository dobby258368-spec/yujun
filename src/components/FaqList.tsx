import type { Faq } from "@/data/services";

export default function FaqList({ faqs, heading = "常見問題" }: { faqs: Faq[]; heading?: string }) {
  return (
    <section className="section faq">
      <div className="wrap narrow">
        <h2 className="sec-title">{heading}<span>FAQ</span></h2>
        {faqs.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
