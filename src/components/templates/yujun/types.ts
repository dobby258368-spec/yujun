// yujun 類型的 block 資料格式。結構沿用 GEO 的 { id, type, data }，type 與 classic 類型完全分開
export type LinkData = { label: string; href: string };
export type Faq = { q: string; a: string };
export type MosaicItem = { heading: string; body: string; image_url: string; href?: string };
type SectionHeading = { heading?: string; sub?: string };

export interface BlockData {
  hero_slider: { title: string; subtitle?: string; cta?: LinkData; slides: { image_url: string; alt: string }[] };
  intro: SectionHeading & { text: string };
  page_title: { title: string; sub?: string; lead?: string; align?: "center" };
  /** source 為 services 時，項目由各服務頁自動產生 */
  mosaic: SectionHeading & { heading_level?: "h2" | "h3"; numbered?: boolean; source?: "services"; items?: MosaicItem[] };
  tile_grid: SectionHeading & {
    background?: "alt";
    source: "services" | "cases";
    limit?: number;
    cols?: 3 | 4;
    intro?: { heading: string; body: string; href?: string; link?: string };
  };
  note: { heading: string; body: string };
  steps: SectionHeading & { items: string[]; text?: string; link?: LinkData };
  post_list: SectionHeading & { heading_tag?: "h1" | "h2"; background?: "alt"; limit?: number; more?: LinkData };
  /** 指定 from（頁面 slug）時，沿用該頁第一個 faq 區塊的問答 */
  faq: { heading?: string; items?: Faq[]; from?: string; limit?: number };
  faq_by_service: Record<string, never>;
  related_reading: SectionHeading;
  related_services: { heading: string };
  service_links: SectionHeading & { columns?: number; max_width?: number; exclude_current?: boolean };
  case_links: SectionHeading & { style: "list" | "paragraphs"; exclude_current?: boolean };
  rich_section: SectionHeading & { background?: "alt"; html: string };
  company_info: SectionHeading;
  contact_panel: { checklist_title: string; checklist: string[] };
  contact_cta: { heading?: string };
}

export type BlockType = keyof BlockData;

export type Block = { [K in BlockType]: { id: string; type: K; data: BlockData[K] } }[BlockType];
