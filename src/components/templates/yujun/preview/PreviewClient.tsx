"use client";

// 即時預覽模組（前台端）：放在前台的預覽頁裡，接收編輯器送來的草稿，用前台的 BlockRenderer 渲染。
// 編輯器在別的網域時設定 NEXT_PUBLIC_EDITOR_ORIGIN，其他來源的訊息一律忽略
import { Component, useEffect, useState, type ReactNode } from "react";
import BlockRenderer from "@/blocks/BlockRenderer";
import Crumbs from "@/components/Crumbs";
import type { Page, Post } from "@/content/types";
import { crumbTrail, type Site } from "@/lib/site";
import { PREVIEW_MESSAGE, type PreviewMessage } from "./protocol";

// 草稿可能還沒填完（例如圖片網址是空的），渲染失敗時提示，下一次修改再重試
class DraftBoundary extends Component<{ draft: unknown; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { draft: unknown }) {
    if (prev.draft !== this.props.draft && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed) return <p style={{ padding: 40, textAlign: "center", color: "#999" }}>內容還沒填完，暫時無法預覽。</p>;
    return this.props.children;
  }
}

export default function PreviewClient({ site, pages, posts }: { site: Site; pages: Page[]; posts: Post[] }) {
  const [message, setMessage] = useState<PreviewMessage | null>(null);

  useEffect(() => {
    const editorOrigin = process.env.NEXT_PUBLIC_EDITOR_ORIGIN || window.location.origin;
    const onMessage = (e: MessageEvent) => {
      if (e.origin === editorOrigin && e.data?.type === PREVIEW_MESSAGE) setMessage(e.data);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: `${PREVIEW_MESSAGE}:ready` }, editorOrigin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!message) return <p style={{ padding: 40, textAlign: "center", color: "#999" }}>等待編輯器…</p>;
  const page = message.draft as unknown as Page;
  // 已發佈的頁面，加上（或換成）正在編輯的草稿
  const merged = [...pages.filter((p) => p.slug !== message.originalSlug && p.slug !== page.slug), page].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <DraftBoundary draft={message.draft}>
      {page.slug !== "home" && <Crumbs items={crumbTrail(page, merged)} />}
      <BlockRenderer blocks={page.content} ctx={{ site, page, pages: merged, posts }} />
    </DraftBoundary>
  );
}
