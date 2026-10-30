// 網站類型對照表。classic 不在這裡：getSiteTemplate 回傳 undefined 時，編輯器的行為與原本完全相同
import type { ComponentType, ReactNode } from "react";
import type { BlockEditorExtension } from "@/components/blocks/BlockEditor";
import { yujunTemplate } from "./yujun";
import PreviewLayout from "./yujun/preview/PreviewLayout"; // 即時預覽模組：第一次嫁接不搬，連同下面的 PreviewLayout 刪掉即可

export interface PagePanelProps {
  slug: string;
  fields: Record<string, unknown>;
  onChange: (fields: Record<string, unknown>) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export interface PreviewLayoutProps {
  draft: Record<string, unknown>;
  originalSlug: string;
  children: ReactNode;
}

export interface SiteTemplate {
  slugPattern: RegExp;
  slugHint: string;
  blockEditor: BlockEditorExtension;
  /** 發佈前檢查內容，回傳給編輯者看的錯誤訊息 */
  validatePage: (page: { slug?: unknown; title?: unknown; meta?: unknown; content?: unknown }) => string[];
  /** 新頁面的預設內容，建立頁面時併入 POST body */
  newPage: (slug: string, pages: { sort_order: number }[]) => Record<string, unknown>;
  /** 頁面名稱和區塊之間的額外面板，編輯 fields（meta、sort_order） */
  PagePanel?: ComponentType<PagePanelProps>;
  /** 公開網址；不提供時用 /{storeSlug}/{slug} */
  publicPath?: (slug: string) => string;
  /** 選配：即時預覽 */
  PreviewLayout?: ComponentType<PreviewLayoutProps>;
}

const TEMPLATES: Record<string, SiteTemplate> = {
  yujun: { ...yujunTemplate, PreviewLayout },
};

export const getSiteTemplate = (name?: string): SiteTemplate | undefined => (name ? TEMPLATES[name] : undefined);
