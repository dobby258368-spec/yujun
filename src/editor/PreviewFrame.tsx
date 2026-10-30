"use client";

// 即時預覽：iframe 載入前台的 /editor-preview/（使用前台的 layout 與 CSS），
// 把未存檔的草稿用 postMessage 傳過去，由前台元件直接渲染
import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import type { Page, Post } from "@/content/types";
import type { Site } from "@/lib/site";

export const PREVIEW_MESSAGE = "yujun-editor-preview";

const WIDTHS = { desktop: 1440, mobile: 390 };

export default function PreviewFrame({ site, page, pages, posts }: { site: Site; page: Page; pages: Page[]; posts: Post[] }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<keyof typeof WIDTHS>("desktop");
  const [size, setSize] = useState({ width: 600, height: 800 });

  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, site, page, pages, posts }, window.location.origin);
  }, [site, page, pages, posts]);

  // 內容一改就送；iframe 載入完成時會先發 ready，再補送一次
  useEffect(() => {
    const t = setTimeout(send, 120);
    return () => clearTimeout(t);
  }, [send]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === `${PREVIEW_MESSAGE}:ready`) send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  // 用實際寬度渲染，再等比縮小放進預覽欄
  const width = WIDTHS[device];
  const scale = Math.min(1, size.width / width);

  return (
    <div className="h-full flex flex-col">
      <div className="h-11 shrink-0 flex items-center justify-between px-4 bg-white border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-600">預覽（未存檔的修改也會顯示）</span>
        <div className="flex gap-1">
          {(["desktop", "mobile"] as const).map((d) => {
            const Icon = d === "desktop" ? Monitor : Smartphone;
            return (
              <button key={d} onClick={() => setDevice(d)} className={`p-1.5 rounded-lg ${device === d ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-700"}`}>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
      <div ref={box} className="flex-1 min-h-0 overflow-hidden flex justify-center">
        <iframe
          ref={frame}
          src="/editor-preview/"
          title="預覽"
          style={{ width, height: size.height / scale, transform: `scale(${scale})`, transformOrigin: "top center", border: 0, background: "#fff", flexShrink: 0 }}
        />
      </div>
    </div>
  );
}
