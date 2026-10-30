import type { ImageMetadata } from "astro";

// src/assets/img 下所有圖片，建置時由 astro:assets 轉成 WebP 並產生多種尺寸
const files = import.meta.glob<{ default: ImageMetadata }>("../assets/img/*", { eager: true });

export function img(name: string): ImageMetadata {
  const mod = files[`../assets/img/${name}`];
  if (!mod) throw new Error(`找不到圖片：${name}`);
  return mod.default;
}
