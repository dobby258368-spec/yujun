import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PreviewClient from "@/editor/PreviewClient";

export const metadata: Metadata = { title: "預覽", robots: { index: false, follow: false } };

// 開發用編輯器的預覽頁：只在 next dev 開放
export default function EditorPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PreviewClient />;
}
