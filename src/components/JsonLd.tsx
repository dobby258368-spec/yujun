export default function JsonLd({ data }: { data: object[] }) {
  return data.map((o, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
  ));
}
