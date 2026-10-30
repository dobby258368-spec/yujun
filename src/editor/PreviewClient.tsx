"use client";

// 預覽頁（/editor-preview/）的內容：接收編輯器送來的草稿，用前台的 BlockRenderer 渲染
import { useEffect, useState } from "react";
import BlockRenderer from "@/blocks/BlockRenderer";
import Crumbs from "@/components/Crumbs";
import type { Page, Post } from "@/content/types";
import { crumbTrail, type Site } from "@/lib/site";
import { PREVIEW_MESSAGE } from "./PreviewFrame";

type Draft = { site: Site; page: Page; pages: Page[]; posts: Post[] };

export default function PreviewClient() {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === PREVIEW_MESSAGE) setDraft(e.data);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: `${PREVIEW_MESSAGE}:ready` }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!draft) return <p style={{ padding: 40, textAlign: "center", color: "#999" }}>等待編輯器…</p>;
  const { site, page, pages, posts } = draft;
  return (
    <>
      {page.slug !== "home" && <Crumbs items={crumbTrail(page, pages)} />}
      <BlockRenderer blocks={page.content} ctx={{ site, page, pages, posts }} />
    </>
  );
}
