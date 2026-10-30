import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "./editor.css";

export const metadata: Metadata = {
  title: "宥涒網站編輯器（開發用）",
  robots: { index: false, follow: false },
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

// 開發用編輯器：只在 next dev 開放，正式環境一律 404
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
