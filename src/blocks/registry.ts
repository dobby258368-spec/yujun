// yujun 類型的 block 定義：名稱、欄位、預設值。編輯器表單與內容驗證都從這裡產生
import type { BlockData, BlockType } from "./types";

export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "image" | "html"; required?: boolean }
  | { key: string; label: string; type: "number"; required?: boolean }
  | { key: string; label: string; type: "boolean" }
  | { key: string; label: string; type: "select"; options: { value: string | number; label: string }[]; required?: boolean }
  | { key: string; label: string; type: "link"; required?: boolean }
  | { key: string; label: string; type: "strings"; required?: boolean }
  | { key: string; label: string; type: "list"; fields: Field[]; required?: boolean }
  | { key: string; label: string; type: "object"; fields: Field[]; required?: boolean };

export interface BlockDef<K extends BlockType = BlockType> {
  label: string;
  desc: string;
  fields: Field[];
  defaults: () => BlockData[K];
}

const heading: Field[] = [
  { key: "heading", label: "區塊標題", type: "text" },
  { key: "sub", label: "英文小標", type: "text" },
];
const background: Field = { key: "background", label: "背景", type: "select", options: [{ value: "", label: "白色" }, { value: "alt", label: "米色" }] };
const headingLevel: Field = { key: "heading_level", label: "項目標題層級", type: "select", options: [{ value: "h2", label: "H2" }, { value: "h3", label: "H3（區塊有標題時）" }] };

export const BLOCKS: { [K in BlockType]: BlockDef<K> } = {
  hero_slider: {
    label: "主視覺輪播",
    desc: "半版高的輪播圖，疊上大標題",
    fields: [
      { key: "title", label: "大標題（H1）", type: "text", required: true },
      { key: "subtitle", label: "副標題", type: "text" },
      { key: "cta", label: "按鈕", type: "link" },
      { key: "slides", label: "輪播圖", type: "list", required: true, fields: [
        { key: "image_url", label: "圖片", type: "image", required: true },
        { key: "alt", label: "圖片說明", type: "text", required: true },
      ] },
    ],
    defaults: () => ({ title: "大標題", subtitle: "", slides: [] }),
  },
  intro: {
    label: "引言",
    desc: "置中的大段文字，可加區塊標題",
    fields: [...heading, { key: "text", label: "內文", type: "textarea", required: true }],
    defaults: () => ({ text: "" }),
  },
  page_title: {
    label: "頁面標題",
    desc: "沒有輪播圖的頁面用的 H1 標題",
    fields: [
      { key: "title", label: "標題（H1）", type: "text", required: true },
      { key: "sub", label: "英文小標", type: "text" },
      { key: "lead", label: "引言（可換行）", type: "textarea" },
      { key: "align", label: "對齊", type: "select", options: [{ value: "", label: "靠左" }, { value: "center", label: "置中" }] },
    ],
    defaults: () => ({ title: "頁面標題" }),
  },
  mosaic: {
    label: "圖文拼接",
    desc: "圖片與文字零間距交錯排列",
    fields: [
      ...heading,
      headingLevel,
      { key: "numbered", label: "顯示編號", type: "boolean" },
      { key: "source", label: "內容來源", type: "select", options: [{ value: "", label: "自行輸入" }, { value: "services", label: "所有服務頁（自動）" }] },
      { key: "items", label: "項目", type: "list", fields: [
        { key: "heading", label: "標題", type: "text", required: true },
        { key: "body", label: "內文", type: "textarea", required: true },
        { key: "image_url", label: "圖片", type: "image", required: true },
        { key: "href", label: "連結", type: "text" },
      ] },
    ],
    defaults: () => ({ numbered: true, heading_level: "h2", items: [] }),
  },
  tile_grid: {
    label: "圖片磚",
    desc: "可點擊的方形圖片磚，自動列出服務或案例",
    fields: [
      ...heading,
      background,
      { key: "source", label: "內容來源", type: "select", required: true, options: [{ value: "services", label: "服務頁" }, { value: "cases", label: "案例頁" }] },
      { key: "limit", label: "最多幾個", type: "number" },
      { key: "cols", label: "每列幾格", type: "select", options: [{ value: 4, label: "4" }, { value: 3, label: "3" }] },
      { key: "intro", label: "開頭說明格", type: "object", fields: [
        { key: "heading", label: "標題", type: "text", required: true },
        { key: "body", label: "內文", type: "textarea", required: true },
        { key: "href", label: "連結", type: "text" },
        { key: "link", label: "連結文字", type: "text" },
      ] },
    ],
    defaults: () => ({ source: "services", cols: 4 }),
  },
  note: {
    label: "說明帶",
    desc: "上下有線的白底置中說明，內文可換行",
    fields: [
      { key: "heading", label: "標題", type: "text", required: true },
      { key: "body", label: "內文", type: "textarea", required: true },
    ],
    defaults: () => ({ heading: "標題", body: "" }),
  },
  steps: {
    label: "流程步驟",
    desc: "編號步驟格",
    fields: [
      ...heading,
      { key: "items", label: "步驟", type: "strings", required: true },
      { key: "text", label: "下方說明", type: "textarea" },
      { key: "link", label: "下方連結", type: "link" },
    ],
    defaults: () => ({ heading: "裝修流程", sub: "Process", items: [] }),
  },
  post_list: {
    label: "文章列表",
    desc: "自動列出文章卡片（依更新日期）",
    fields: [
      ...heading,
      { key: "heading_tag", label: "標題層級", type: "select", options: [{ value: "h2", label: "H2" }, { value: "h1", label: "H1（文章列表頁）" }] },
      background,
      { key: "limit", label: "最多幾篇", type: "number" },
      { key: "more", label: "更多連結", type: "link" },
    ],
    defaults: () => ({ heading: "裝修知識", sub: "Articles", heading_tag: "h2", limit: 3 }),
  },
  faq: {
    label: "常見問題",
    desc: "可展開的問答；也可沿用其他頁的問答",
    fields: [
      { key: "heading", label: "標題", type: "text" },
      { key: "items", label: "問答", type: "list", fields: [
        { key: "q", label: "問題", type: "text", required: true },
        { key: "a", label: "回答", type: "textarea", required: true },
      ] },
      { key: "from", label: "沿用哪一頁的問答（頁面 slug）", type: "text" },
      { key: "limit", label: "最多幾題", type: "number" },
    ],
    defaults: () => ({ heading: "常見問題", items: [] }),
  },
  faq_by_service: {
    label: "各服務常見問題",
    desc: "自動列出每個服務頁的問答",
    fields: [],
    defaults: () => ({}),
  },
  related_reading: {
    label: "延伸閱讀",
    desc: "服務頁專用：自動列出相關文章與案例",
    fields: heading,
    defaults: () => ({ heading: "延伸閱讀", sub: "Read More" }),
  },
  related_services: {
    label: "相關服務",
    desc: "案例頁專用：列出這個案例的相關服務",
    fields: [{ key: "heading", label: "標題", type: "text", required: true }],
    defaults: () => ({ heading: "相關服務" }),
  },
  service_links: {
    label: "服務連結清單",
    desc: "自動列出所有服務頁的連結",
    fields: [
      ...heading,
      { key: "columns", label: "欄數", type: "number" },
      { key: "max_width", label: "最大寬度（px）", type: "number" },
      { key: "exclude_current", label: "排除目前這一頁", type: "boolean" },
    ],
    defaults: () => ({ columns: 2, max_width: 720 }),
  },
  case_links: {
    label: "案例連結清單",
    desc: "自動列出所有案例的標題與摘要",
    fields: [
      ...heading,
      { key: "style", label: "樣式", type: "select", required: true, options: [{ value: "paragraphs", label: "段落" }, { value: "list", label: "清單" }] },
      { key: "exclude_current", label: "排除目前這一頁", type: "boolean" },
    ],
    defaults: () => ({ style: "paragraphs" }),
  },
  rich_section: {
    label: "圖文編輯段落",
    desc: "自由編排的文字段落",
    fields: [...heading, background, { key: "html", label: "內容", type: "html", required: true }],
    defaults: () => ({ html: "" }),
  },
  company_info: {
    label: "公司資訊",
    desc: "自動帶入名稱、地址、電話、服務地區與項目",
    fields: heading,
    defaults: () => ({ heading: "公司資訊", sub: "Company" }),
  },
  contact_panel: {
    label: "聯絡資訊與地圖",
    desc: "自動帶入聯絡方式與地圖，可加準備清單",
    fields: [
      { key: "checklist_title", label: "清單標題", type: "text", required: true },
      { key: "checklist", label: "清單項目", type: "strings", required: true },
    ],
    defaults: () => ({ checklist_title: "諮詢前可以準備的資料", checklist: [] }),
  },
  contact_cta: {
    label: "聯絡橫幅",
    desc: "深色底的 LINE 與電話按鈕",
    fields: [{ key: "heading", label: "標題（空白用預設）", type: "text" }],
    defaults: () => ({}),
  },
};

// ── 驗證：依欄位定義檢查型別與必填，回傳錯誤訊息（空陣列表示通過）

function checkFields(fields: Field[], data: Record<string, unknown>, at: string): string[] {
  const errors: string[] = [];
  for (const f of fields) {
    const v = data[f.key];
    const where = `${at}.${f.key}`;
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    if (empty) {
      if ("required" in f && f.required) errors.push(`${where} 必填`);
      continue;
    }
    switch (f.type) {
      case "text":
      case "textarea":
      case "image":
      case "html":
        if (typeof v !== "string") errors.push(`${where} 應為文字`);
        break;
      case "number":
        if (typeof v !== "number") errors.push(`${where} 應為數字`);
        break;
      case "boolean":
        if (typeof v !== "boolean") errors.push(`${where} 應為是／否`);
        break;
      case "select":
        if (!f.options.some((o) => o.value === v)) errors.push(`${where} 不是可選的值：${String(v)}`);
        break;
      case "link": {
        const l = v as Record<string, unknown>;
        if (typeof l.label !== "string" || typeof l.href !== "string") errors.push(`${where} 應有 label 與 href`);
        break;
      }
      case "strings":
        if (!Array.isArray(v) || v.some((s) => typeof s !== "string")) errors.push(`${where} 應為文字清單`);
        break;
      case "list":
        if (!Array.isArray(v)) errors.push(`${where} 應為清單`);
        else v.forEach((item, i) => errors.push(...checkFields(f.fields, item as Record<string, unknown>, `${where}[${i}]`)));
        break;
      case "object":
        errors.push(...checkFields(f.fields, v as Record<string, unknown>, where));
        break;
    }
  }
  return errors;
}

export function validateBlocks(blocks: unknown, at = "content"): string[] {
  if (!Array.isArray(blocks)) return [`${at} 應為 block 清單`];
  return blocks.flatMap((b, i) => {
    const where = `${at}[${i}]`;
    const def = BLOCKS[b?.type as BlockType];
    if (!def) return [`${where} 未知的 block 類型：${String(b?.type)}`];
    if (typeof b.id !== "string" || !b.id) return [`${where} 缺少 id`];
    return checkFields(def.fields, b.data ?? {}, `${where}(${b.type})`);
  });
}
