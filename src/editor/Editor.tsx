"use client";

// 開發用編輯器主畫面：左側頁面清單、中間頁面設定與區塊編輯、右側即時預覽。
// 頁面設定（名稱、slug、SEO、發佈）的版面沿用 GEO 的 dashboard/website/[id]
import { useMemo, useState } from "react";
import { ExternalLink, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { BLOCKS, metaFieldsFor } from "@/blocks/registry";
import type { Block, BlockType } from "@/blocks/types";
import type { Page, Post } from "@/content/types";
import { isServicePage, pagePath, serviceKey, type Site } from "@/lib/site";
import BlockEditor from "./BlockEditor";
import { Fields, inputClass } from "./FieldInput";
import PreviewFrame from "./PreviewFrame";

type Kind = "page" | "service" | "case";

const KIND_LABEL: Record<Kind, string> = { page: "一般頁面", service: "服務頁", case: "案例頁" };
const kindOf = (slug: string): Kind => (slug.startsWith("services/") ? "service" : slug.startsWith("cases/") ? "case" : "page");

// 新頁面的預設區塊組合
const TEMPLATES: Record<Kind, BlockType[]> = {
  page: ["page_title", "contact_cta"],
  service: ["hero_slider", "intro", "mosaic", "faq", "related_reading", "service_links", "contact_cta"],
  case: ["hero_slider", "intro", "mosaic", "related_services", "case_links", "contact_cta"],
};

function newBlocks(kind: Kind): Block[] {
  return TEMPLATES[kind].map((type) => {
    const data = BLOCKS[type].defaults() as Record<string, unknown>;
    if (type === "service_links") Object.assign(data, { heading: "其他服務", sub: "Services", columns: 3, max_width: 900, exclude_current: true });
    if (type === "case_links") Object.assign(data, { heading: "其他實績", sub: "More Projects", style: "list", exclude_current: true });
    return { id: crypto.randomUUID(), type, data } as Block;
  });
}

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/editor/upload/", { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "上傳失敗");
  return json;
}

export default function Editor({ site, initialPages, posts }: { site: Site; initialPages: Page[]; posts: Post[] }) {
  const [pages, setPages] = useState(initialPages);
  // originalSlug 為 null 表示尚未存檔的新頁面
  const [originalSlug, setOriginalSlug] = useState<string | null>("home");
  const [draft, setDraft] = useState<Page>(() => initialPages.find((p) => p.slug === "home") ?? initialPages[0]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const edit = (patch: Partial<Page>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    setMessage("");
  };

  const confirmLeave = () => !dirty || window.confirm("目前頁面有未儲存的修改，確定要離開嗎？");

  const open = (p: Page) => {
    if (!confirmLeave()) return;
    setDraft(p);
    setOriginalSlug(p.slug);
    setDirty(false);
    setErrors([]);
    setMessage("");
  };

  const create = (kind: Kind) => {
    if (!confirmLeave()) return;
    const prefix = kind === "service" ? "services/" : kind === "case" ? "cases/" : "";
    const meta = kind === "service" ? { short: "", en: "", hero: "", summary: "" } : kind === "case" ? { type: "", cover: "", summary: "", services: [] } : null;
    setDraft({
      slug: `${prefix}new-page`,
      title: `新${KIND_LABEL[kind]}`,
      sort_order: Math.max(0, ...pages.map((p) => p.sort_order)) + 1,
      is_published: false,
      seo_title: null,
      seo_description: null,
      meta: meta as Page["meta"],
      content: newBlocks(kind),
    });
    setOriginalSlug(null);
    setDirty(true);
    setErrors([]);
    setMessage("");
  };

  const save = async (patch: Partial<Page> = {}) => {
    const page = { ...draft, ...patch };
    setSaving(true);
    setErrors([]);
    try {
      const res = await fetch("/api/editor/pages/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_slug: originalSlug ?? undefined, page }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(Array.isArray(json.detail) ? json.detail : [String(json.detail)]);
        return;
      }
      setPages((list) => [...list.filter((p) => p.slug !== originalSlug && p.slug !== json.slug), json].sort((a, b) => a.sort_order - b.sort_order));
      setDraft(json);
      setOriginalSlug(json.slug);
      setDirty(false);
      setMessage("已儲存");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!originalSlug || !window.confirm(`確定要刪除「${draft.title}」？`)) return;
    const res = await fetch(`/api/editor/pages/?slug=${encodeURIComponent(originalSlug)}`, { method: "DELETE" });
    if (!res.ok) return setErrors(["刪除失敗"]);
    const rest = pages.filter((p) => p.slug !== originalSlug);
    setPages(rest);
    setDirty(false);
    const home = rest.find((p) => p.slug === "home") ?? rest[0];
    setDraft(home);
    setOriginalSlug(home.slug);
  };

  const kind = kindOf(draft.slug);
  const metaFields = metaFieldsFor(draft.slug);
  const prefix = kind === "service" ? "services/" : kind === "case" ? "cases/" : "";
  const serviceOptions = useMemo(
    () => pages.filter(isServicePage).map((p) => ({ key: serviceKey(p), label: p.title })),
    [pages],
  );

  // 預覽用的頁面清單：已發佈的頁面，加上（或換成）正在編輯的草稿
  const previewPages = useMemo(
    () => [...pages.filter((p) => p.is_published && p.slug !== originalSlug && p.slug !== draft.slug), draft].sort((a, b) => a.sort_order - b.sort_order),
    [pages, draft, originalSlug],
  );

  const groups: Kind[] = ["page", "service", "case"];

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-white border-b border-slate-200">
        <div className="font-bold text-slate-800">{site.name}・網站編輯器 <span className="ml-2 text-xs font-normal text-slate-400">開發用，存檔寫入 content/</span></div>
        <a href="/" target="_blank" className="text-sm text-slate-500 hover:text-blue-600 inline-flex items-center"><ExternalLink className="w-4 h-4 mr-1" />開啟網站</a>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* 頁面清單 */}
        <nav className="w-60 shrink-0 overflow-y-auto bg-white border-r border-slate-200 p-3 space-y-5">
          {groups.map((g) => (
            <div key={g}>
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{KIND_LABEL[g]}</span>
                <button onClick={() => create(g)} title={`新增${KIND_LABEL[g]}`} className="p-1 text-slate-400 hover:text-blue-600"><Plus className="w-4 h-4" /></button>
              </div>
              {pages.filter((p) => kindOf(p.slug) === g).map((p) => (
                <button
                  key={p.slug}
                  onClick={() => open(p)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm truncate ${p.slug === originalSlug ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  {p.title}
                  {!p.is_published && <span className="ml-1 text-xs text-slate-400">（草稿）</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* 編輯區 */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-500">
              {KIND_LABEL[kind]}・{draft.is_published ? <span className="text-green-600 font-semibold">已發佈</span> : "草稿"}
              {dirty && <span className="ml-2 text-amber-600">未儲存</span>}
              {message && <span className="ml-2 text-green-600">{message}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSeo(!showSeo)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50">SEO 設定</button>
              {originalSlug && draft.is_published && (
                <a href={pagePath(originalSlug)} target="_blank" className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50">
                  <ExternalLink className="h-4 w-4 mr-1.5" />開啟
                </a>
              )}
              {originalSlug && originalSlug !== "home" && (
                <button onClick={remove} className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-red-600 bg-white hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1.5" />刪除
                </button>
              )}
              <button
                onClick={() => save({ is_published: !draft.is_published })}
                disabled={saving || draft.slug === "home"}
                title={draft.slug === "home" ? "首頁必定公開" : ""}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 ${draft.is_published ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"}`}
              >
                {draft.is_published ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {draft.is_published ? "取消發佈" : "發佈"}
              </button>
              <button onClick={() => save()} disabled={saving} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4 mr-2" />{saving ? "儲存中..." : "儲存"}
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">無法儲存：</p>
              <ul className="list-disc pl-5 space-y-0.5">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          {showSeo && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">SEO / GEO 設定</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SEO 標題 <span className="text-slate-400 font-normal">（留空則使用頁面名稱）</span></label>
                <input type="text" value={draft.seo_title ?? ""} onChange={(e) => edit({ seo_title: e.target.value })} placeholder={draft.title} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meta 描述 <span className="text-slate-400 font-normal">（建議 120~160 字，AI 最愛引用這段）</span></label>
                <textarea value={draft.seo_description ?? ""} onChange={(e) => edit({ seo_description: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">頁面名稱 <span className="text-slate-400 font-normal">（導覽、麵包屑、列表使用）</span></label>
              <input type="text" value={draft.title} onChange={(e) => edit({ title: e.target.value })} className="block w-full rounded-xl border border-slate-300 text-xl font-bold h-14 px-5" />
            </div>
            {draft.slug !== "home" && (
              <div className="grid grid-cols-[1fr_auto] gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL Slug (網址路徑)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">/{prefix}</span>
                    <input
                      type="text"
                      value={draft.slug.slice(prefix.length)}
                      onChange={(e) => edit({ slug: prefix + e.target.value.toLowerCase() })}
                      className="flex-1 min-w-0 rounded-r-xl border border-slate-300 text-sm h-11 px-4"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">排序</label>
                  <input type="number" value={draft.sort_order} onChange={(e) => edit({ sort_order: Number(e.target.value) })} className={`${inputClass} w-24 h-11`} />
                </div>
              </div>
            )}
          </div>

          {metaFields && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-700 mb-4">{KIND_LABEL[kind]}資料 <span className="font-normal text-slate-400">（其他頁面的列表、圖片磚、頁尾會引用）</span></h2>
              <Fields
                fields={metaFields}
                data={(draft.meta ?? {}) as Record<string, unknown>}
                onChange={(meta) => edit({ meta: meta as unknown as Page["meta"] })}
                ctx={{ onUploadImage: uploadImage, serviceOptions }}
              />
            </div>
          )}

          <BlockEditor blocks={draft.content} onChange={(content) => edit({ content })} onUploadImage={uploadImage} serviceOptions={serviceOptions} />
        </main>

        {/* 即時預覽 */}
        <aside className="w-[45%] shrink-0 border-l border-slate-200 bg-slate-100">
          <PreviewFrame site={site} page={draft} pages={previewPages} posts={posts} />
        </aside>
      </div>
    </div>
  );
}
