"use client";

// yujun 網站類型接進 GEO 編輯器的部分：區塊選單、表單、驗證、新頁面預設內容
import {
  AlignLeft, BookOpen, Building2, CircleHelp, FileText, Grid2x2, Images, LayoutGrid, Link2, ListChecks,
  ListOrdered, MapPin, Megaphone, Newspaper, Rows3, Tags, Type,
} from "lucide-react";
import type { PageBlock } from "@/components/blocks/BlockEditor";
import type { PagePanelProps, SiteTemplate } from "..";
import { Fields, inputClass } from "./FieldInput";
import { BLOCKS, SERVICE_META_FIELDS, CASE_META_FIELDS, SLUG_PATTERN, metaFieldsFor, validatePage } from "./registry";
import type { BlockType } from "./types";

const ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  hero_slider: Images,
  intro: AlignLeft,
  page_title: Type,
  mosaic: LayoutGrid,
  tile_grid: Grid2x2,
  note: Rows3,
  steps: ListOrdered,
  post_list: Newspaper,
  faq: CircleHelp,
  faq_by_service: CircleHelp,
  related_reading: BookOpen,
  related_services: Tags,
  service_links: Link2,
  case_links: ListChecks,
  rich_section: FileText,
  company_info: Building2,
  contact_panel: MapPin,
  contact_cta: Megaphone,
};

const defaultData = (type: string) => BLOCKS[type as BlockType].defaults() as Record<string, unknown>;

function renderForm(block: PageBlock, onChange: (data: Record<string, unknown>) => void, onUploadImage?: (file: File) => Promise<string>) {
  const def = BLOCKS[block.type as BlockType];
  if (!def) return <p className="text-sm text-red-500">未知的區塊類型：{block.type}</p>;
  if (!def.fields.length) return <p className="text-sm text-slate-400">此區塊自動產生內容，不需要設定。</p>;
  return <Fields fields={def.fields} data={block.data} onChange={onChange} ctx={{ onUploadImage }} />;
}

// 新頁面依 slug 前綴帶入預設區塊
const PRESETS: { prefix: string; blocks: BlockType[]; meta: Record<string, unknown> | null }[] = [
  {
    prefix: "services/",
    blocks: ["hero_slider", "intro", "mosaic", "faq", "related_reading", "service_links", "contact_cta"],
    meta: { short: "", en: "", hero: "", summary: "" },
  },
  {
    prefix: "cases/",
    blocks: ["hero_slider", "intro", "mosaic", "related_services", "case_links", "contact_cta"],
    meta: { type: "", cover: "", summary: "", services: [] },
  },
  { prefix: "", blocks: ["page_title", "contact_cta"], meta: null },
];

function newPage(slug: string, pages: { sort_order: number }[]) {
  const preset = PRESETS.find((p) => slug.startsWith(p.prefix))!;
  return {
    template: "yujun",
    sort_order: Math.max(0, ...pages.map((p) => p.sort_order)) + 1,
    meta: preset.meta,
    content: preset.blocks.map((type) => {
      const data = defaultData(type);
      if (type === "service_links") Object.assign(data, { heading: "其他服務", sub: "Services", columns: 3, max_width: 900, exclude_current: true });
      if (type === "case_links") Object.assign(data, { heading: "其他實績", sub: "More Projects", style: "list", exclude_current: true });
      return { id: crypto.randomUUID(), type, data };
    }),
  };
}

// 服務頁、案例頁的結構化資料與排序
function PagePanel({ slug, fields, onChange, onUploadImage }: PagePanelProps) {
  const metaFields = metaFieldsFor(slug);
  const title = metaFields === SERVICE_META_FIELDS ? "服務頁資料" : metaFields === CASE_META_FIELDS ? "案例頁資料" : "頁面資料";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h2 className="text-sm font-bold text-slate-700">{title} <span className="font-normal text-slate-400">（其他頁面的列表、圖片磚、頁尾會引用）</span></h2>
      {metaFields && (
        <Fields
          fields={metaFields}
          data={(fields.meta ?? {}) as Record<string, unknown>}
          onChange={(meta) => onChange({ ...fields, meta })}
          ctx={{ onUploadImage }}
        />
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">排序 <span className="text-slate-400 font-normal">（數字小的在前）</span></label>
        <input
          type="number"
          value={String(fields.sort_order ?? 0)}
          onChange={(e) => onChange({ ...fields, sort_order: Number(e.target.value) })}
          className={`${inputClass} max-w-40`}
        />
      </div>
    </div>
  );
}

// 網域確定後設定 NEXT_PUBLIC_YUJUN_SITE_URL；留空時用目前網域的根目錄
const SITE_URL = process.env.NEXT_PUBLIC_YUJUN_SITE_URL ?? "";

export const yujunTemplate: SiteTemplate = {
  slugPattern: SLUG_PATTERN,
  slugHint: "小寫英文、數字、連字號。服務頁用 services/xxx，案例頁用 cases/xxx",
  blockEditor: {
    blockTypes: (Object.keys(BLOCKS) as BlockType[]).map((type) => ({ type, label: BLOCKS[type].label, icon: ICONS[type], desc: BLOCKS[type].desc })),
    getDefaultData: defaultData,
    renderForm,
  },
  validatePage,
  newPage,
  PagePanel,
  publicPath: (slug) => `${SITE_URL}${slug === "home" ? "/" : `/${slug}/`}`,
};
