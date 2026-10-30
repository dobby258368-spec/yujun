// 內容資料格式：對齊 GEO 公開 API（GEO commit 00373bc）的 Store、Page、Post 回應。
// 標「擴充」的欄位 GEO 目前沒有，規格見 GEO-INTEGRATION.md
import type { Block } from "@/components/templates/yujun/types";

export interface Store {
  name: string;
  slug: string;
  target_keywords: string[] | null;
  description: string | null;
  contact_info: { phone?: string; email?: string; address?: string } | null;
  social_links: { facebook?: string; instagram?: string; line?: string } | null;
  promo_blocks: unknown[] | null;
  official_website: string | null;
  press_mentions: string[];
  /** 擴充：網站類型 */
  site_template: "yujun";
  /** 擴充：yujun 類型的全站設定 */
  template_settings: TemplateSettings;
}

export interface TemplateSettings {
  logo: { text: string; sub: string };
  tagline: string;
  phone_intl: string;
  address: { region: string; locality: string; street: string; country: string };
  area_served: string[];
  /** 頁尾、聯絡區塊顯示的服務地區文字 */
  area_text: string;
  work_items: string[];
  nav: { href: string; label: string }[];
  default_image: string;
}

/** 服務頁（slug 為 services/xxx）的擴充 meta：供首頁磚格、服務列表、頁尾等引用 */
export interface ServiceMeta {
  short: string;
  en: string;
  hero: string;
  summary: string;
}

/** 案例頁（slug 為 cases/xxx）的擴充 meta */
export interface CaseMeta {
  type: string;
  cover: string;
  summary: string;
  /** 相關服務：服務頁 slug 去掉 services/ 的部分 */
  services: string[];
}

export interface Page {
  /** 對應網址路徑，可含 /（例如 services/turnkey）；首頁為 home */
  slug: string;
  title: string;
  sort_order: number;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  /** 擴充：頁面層級的結構化資料 */
  meta: ServiceMeta | CaseMeta | null;
  content: Block[];
}

export interface Post {
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  excerpt: string | null;
  html_content: string | null;
  markdown_content: string | null;
  created_at: string;
  updated_at: string | null;
  /** 擴充：封面、摘要描述、相關服務 */
  meta: { cover: string; description: string; service: string | null };
}
