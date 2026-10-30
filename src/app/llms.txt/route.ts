import { SITE, WORK_ITEMS } from "@/data/site";
import { SERVICES } from "@/data/services";
import { CASES } from "@/data/cases";
import { SITE_URL } from "@/lib/seo";
import posts from "@/data/posts.json";

export const dynamic = "force-static";

// 給 AI 搜尋 / LLM 讀的網站摘要（llms.txt）
export function GET() {
  const u = (p: string) => new URL(p, SITE_URL).href;
  const body = `# ${SITE.name}

> ${SITE.description}

- 電話：${SITE.phone}
- 地址：${SITE.address.full}
- 服務地區：桃園、中壢及周邊地區
- LINE：${SITE.line}
- 承接工程：${WORK_ITEMS.join("、")}

## 服務項目
${SERVICES.map((s) => `- [${s.keyword}](${u(`/services/${s.slug}/`)})：${s.seoDescription}`).join("\n")}

## 工程實績
${CASES.map((c) => `- [${c.title}](${u(`/cases/${c.slug}/`)})：${c.summary}`).join("\n")}

## 裝修知識
${posts.map((p) => `- [${p.title}](${u(`/blog/${p.slug}/`)})`).join("\n")}

## 其他
- [裝修流程與工序](${u("/process/")})
- [常見問題](${u("/faq/")})
- [關於宥涒](${u("/about/")})
- [聯絡我們](${u("/contact/")})
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
