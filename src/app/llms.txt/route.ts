import { STORE_SLUG, getStore, getStorePages, getStorePosts, pagePath } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { isCasePage, isServicePage, siteOf } from "@/lib/site";

export const revalidate = 60;

// 給 AI 搜尋 / LLM 讀的網站摘要（llms.txt）
export async function GET() {
  const [store, pages, posts] = await Promise.all([getStore(STORE_SLUG), getStorePages(STORE_SLUG), getStorePosts(STORE_SLUG)]);
  if (!store) return new Response("Not found", { status: 404 });
  const site = siteOf(store);
  const u = (p: string) => new URL(p, SITE_URL).href;
  const others = ["process", "faq", "about", "contact"]
    .map((slug) => pages.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);
  const body = `# ${site.name}

> ${site.description}

- 電話：${site.phone}
- 地址：${site.address.full}
- 服務地區：${site.areaText}
- LINE：${site.line}
- 承接工程：${site.workItems.join("、")}

## 服務項目
${pages.filter(isServicePage).map((s) => `- [${s.title}](${u(pagePath(s.slug))})：${s.seo_description}`).join("\n")}

## 工程實績
${pages.filter(isCasePage).map((c) => `- [${c.title}](${u(pagePath(c.slug))})：${c.meta.summary}`).join("\n")}

## 裝修知識
${posts.map((p) => `- [${p.title}](${u(`/blog/${p.slug}/`)})`).join("\n")}

## 其他
${others.map((p) => `- [${p.title}](${u(pagePath(p.slug))})`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
