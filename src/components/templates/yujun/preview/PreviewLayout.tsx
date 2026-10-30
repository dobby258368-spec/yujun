"use client";

// 即時預覽模組（編輯器端）：編輯區右邊放一個 iframe，載入前台的預覽頁，把未存檔的草稿用 postMessage 傳過去。
// 這個模組只靠 protocol.ts 和前台溝通，不依賴前台程式；前台與編輯器不同網域時設定 NEXT_PUBLIC_YUJUN_PREVIEW_URL
import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import type { PreviewLayoutProps } from "../..";
import { PREVIEW_MESSAGE, type PreviewMessage } from "./protocol";

const PREVIEW_URL = process.env.NEXT_PUBLIC_YUJUN_PREVIEW_URL || "/editor-preview/";
const WIDTHS = { desktop: 1440, mobile: 390 };

export default function PreviewLayout({ draft, originalSlug, children }: PreviewLayoutProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0">{children}</div>
      <aside className="hidden xl:block w-[45%] shrink-0 sticky top-0 h-[calc(100vh-4rem)] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
        <PreviewFrame draft={draft} originalSlug={originalSlug} />
      </aside>
    </div>
  );
}

function PreviewFrame({ draft, originalSlug }: Omit<PreviewLayoutProps, "children">) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<keyof typeof WIDTHS>("desktop");
  const [size, setSize] = useState({ width: 600, height: 800 });

  const send = useCallback(() => {
    const message: PreviewMessage = { type: PREVIEW_MESSAGE, draft, originalSlug };
    frame.current?.contentWindow?.postMessage(message, new URL(PREVIEW_URL, window.location.href).origin);
  }, [draft, originalSlug]);

  // 內容一改就送；iframe 載入完成時會先發 ready，再補送一次
  useEffect(() => {
    const t = setTimeout(send, 120);
    return () => clearTimeout(t);
  }, [send]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && e.data?.type === `${PREVIEW_MESSAGE}:ready`) send();
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

  // 用實際寬度渲染，再等比縮小放進預覽欄。視窗窄於 1280px 時預覽欄隱藏、量到的寬度是 0，不能拿來算比例
  const width = WIDTHS[device];
  const scale = size.width > 0 ? Math.min(1, size.width / width) : 1;

  return (
    <div className="h-full flex flex-col">
      <div className="h-11 shrink-0 flex items-center justify-between px-4 bg-white border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-600">預覽（未存檔的修改也會顯示）</span>
        <div className="flex gap-1">
          {(["desktop", "mobile"] as const).map((d) => {
            const Icon = d === "desktop" ? Monitor : Smartphone;
            return (
              <button key={d} aria-label={d === "desktop" ? "桌面版" : "手機版"} onClick={() => setDevice(d)} className={`p-1.5 rounded-lg ${device === d ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-700"}`}>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
      <div ref={box} className="flex-1 min-h-0 overflow-hidden flex justify-center">
        <iframe
          ref={frame}
          src={PREVIEW_URL}
          title="預覽"
          style={{ width, height: size.height / scale, transform: `scale(${scale})`, transformOrigin: "top center", border: 0, background: "#fff", flexShrink: 0 }}
        />
      </div>
    </div>
  );
}
