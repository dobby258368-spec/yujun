import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "./editor.css";

export const metadata: Metadata = {
  title: "宥涒網站編輯器（開發用）",
  robots: { index: false, follow: false },
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

// 開發用：在本機跑 GEO 的編輯頁（dashboard/website），路徑、版面同 GEO 後台的內容區。只在 next dev 開放，不搬進 GEO
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <html lang="zh-Hant-TW">
      <body className="antialiased">
        <div className="h-screen bg-slate-50 flex overflow-hidden">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
