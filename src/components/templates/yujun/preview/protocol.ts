// 即時預覽的訊息格式：編輯器（PreviewLayout）→ 前台預覽頁（PreviewClient）
export const PREVIEW_MESSAGE = "yujun-editor-preview";

export interface PreviewMessage {
  type: typeof PREVIEW_MESSAGE;
  draft: Record<string, unknown>;
  originalSlug: string;
}
