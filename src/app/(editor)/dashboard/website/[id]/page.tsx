"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff, ExternalLink, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import Modal, { ModalType } from "@/components/ui/Modal";

import BlockEditor, { PageBlock } from "@/components/blocks/BlockEditor";
import { getSiteTemplate, type SiteTemplate } from "@/components/templates";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: PageBlock[] | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  sort_order: number;
  meta?: unknown;
  created_at?: string;
  updated_at?: string | null;
}

export default function WebsitePageEditor() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [storeSlug, setStoreSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  // classic 為 undefined；其他網站類型的差異都由 template 提供
  const [template, setTemplate] = useState<SiteTemplate | undefined>();
  const [templateFields, setTemplateFields] = useState<Record<string, unknown>>({});

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    description?: string;
  }>({ isOpen: false, type: "info", title: "" });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [storeRes, pageRes] = await Promise.all([
          authFetch("/api/v1/stores/me"),
          authFetch(`/api/v1/pages/${pageId}`),
        ]);
        if (storeRes.ok) {
          const store = await storeRes.json();
          setStoreSlug(store.slug || "");
          setTemplate(getSiteTemplate(store.site_template));
        }
        if (pageRes.ok) {
          const data: PageData = await pageRes.json();
          setPageData(data);
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setBlocks(data.content || []);
          setSeoTitle(data.seo_title || "");
          setSeoDescription(data.seo_description || "");
          setIsPublished(data.is_published || false);
          setTemplateFields({ meta: data.meta, sort_order: data.sort_order });
        } else {
          router.push("/dashboard/website");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [pageId, router]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlug(val);
    if (!(template?.slugPattern ?? /^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(val) && val !== "") {
      setSlugError(template?.slugHint ?? "Slug 只能包含小寫英文字母、數字和連字號，例如：about-us");
    } else if (val === "home" && pageData?.slug !== "home") {
      setSlugError("保留字 'home' 專供系統首頁使用，請換一個名稱");
    } else {
      setSlugError("");
    }
  };

  const handleSave = async (publishState?: boolean) => {
    if (slugError) {
      setModalState({ isOpen: true, type: "error", title: "儲存失敗", description: "網址路徑格式不正確" });
      return;
    }
    
    if (template && (publishState ?? isPublished)) {
      const errors = template.validatePage({ slug: slug.trim(), title: title.trim(), content: blocks, ...templateFields });
      if (errors.length) {
        setModalState({ isOpen: true, type: "error", title: "內容未填完，無法發佈", description: errors.join("；") });
        return;
      }
    }

    setIsSaving(true);
    const newPublishedState = publishState !== undefined ? publishState : isPublished;
    try {
      const res = await authFetch(`/api/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content: blocks,
          seo_title: seoTitle.trim() || null,
          seo_description: seoDescription.trim() || null,
          is_published: newPublishedState,
          ...(template ? templateFields : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "儲存失敗");
      }
      setIsPublished(newPublishedState);
      setModalState({ isOpen: true, type: "success", title: "儲存成功！", description: newPublishedState ? "頁面已發佈，訪客現在可以瀏覽。" : "頁面已儲存為草稿。" });
      
      // Update pageData so the header URL is correct
      setPageData(prev => prev ? { ...prev, slug: slug.trim(), title: title.trim() } : null);
    } catch (err: any) {
      setModalState({ isOpen: true, type: "error", title: "儲存失敗", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await authFetch("/api/v1/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return await res.json();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pageData) return null;

  const publicPath = (s: string) => template?.publicPath?.(s) ?? `/${storeSlug}${s === "home" ? "" : `/${s}`}`;

  const editor = (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/website"
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              編輯頁面 {pageData.slug === "home" && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">首頁</span>}
            </h1>
            <code className="text-xs text-slate-400">{publicPath(pageData.slug)}</code>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSeoPanel(!showSeoPanel)}
            className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4 mr-1.5" />
            SEO 設定
          </button>
          {storeSlug && isPublished && (
            <a
              href={publicPath(pageData.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              預覽
            </a>
          )}
          <button
            onClick={() => handleSave(!isPublished)}
            disabled={isSaving || pageData.slug === "home"}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              isPublished ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"
            }`}
            title={pageData.slug === "home" ? "首頁必定公開" : ""}
          >
            {isPublished ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isSaving ? "處理中..." : isPublished ? "取消發佈" : "發佈"}
          </button>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "儲存中..." : "儲存"}
          </button>
        </div>
      </div>

      {/* SEO Panel (collapsible) */}
      {showSeoPanel && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">SEO / GEO 設定</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SEO 標題 <span className="text-slate-400 font-normal">（留空則使用頁面名稱）</span>
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 sm:text-sm h-11 px-4"
                placeholder={title}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Meta 描述 <span className="text-slate-400 font-normal">（建議 120~160 字，AI 最愛引用這段）</span>
              </label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 sm:text-sm h-11 px-4"
                placeholder="簡短描述本頁面的主題和核心價值..."
              />
            </div>
          </div>
          <p className="text-xs text-amber-700">
            💡 提示：AI 搜尋引擎（如 ChatGPT、Perplexity）在選擇引用來源時，Meta 描述的品質非常關鍵！建議用「問題 + 解答」的句型撰寫。
          </p>
        </div>
      )}

      {/* Page Title & Slug */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">頁面名稱</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xl font-bold h-14 px-5"
            placeholder="頁面名稱（例如：關於我們）"
          />
        </div>

        {pageData.slug !== "home" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">URL Slug (網址路徑)</label>
            <div className="flex rounded-xl shadow-sm">
              <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                {template ? "/" : `/${storeSlug}/`}
              </span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                className={`flex-1 block w-full min-w-0 rounded-none rounded-r-xl sm:text-sm h-11 px-4 ${
                  slugError ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="例如：about-us"
              />
            </div>
            {slugError && <p className="mt-1 text-xs text-red-500">{slugError}</p>}
          </div>
        )}
      </div>

      {template?.PagePanel && (
        <template.PagePanel slug={slug} fields={templateFields} onChange={setTemplateFields} onUploadImage={handleUploadImage} />
      )}

      {/* Block Editor */}
      <BlockEditor
        blocks={blocks}
        onChange={setBlocks}
        onUploadImage={handleUploadImage}
        extension={template?.blockEditor}
      />

      {/* Status info */}
      <div className="flex items-center justify-between text-sm text-slate-400 pb-10">
        <span>
          狀態：
          <span className={`ml-1 font-semibold ${isPublished ? "text-green-600" : "text-slate-500"}`}>
            {isPublished ? "已發佈" : "草稿"}
          </span>
        </span>
        <span>最後更新：{pageData.created_at ? new Date(pageData.created_at).toLocaleDateString("zh-TW") : "—"}</span>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        description={modalState.description}
      />
    </div>
  );

  // 即時預覽是選配模組：網站類型沒有提供 PreviewLayout 時，畫面與原本完全相同
  if (!template?.PreviewLayout) return editor;
  return (
    <template.PreviewLayout
      draft={{ slug: slug.trim(), title, content: blocks, seo_title: seoTitle, seo_description: seoDescription, is_published: isPublished, ...templateFields }}
      originalSlug={pageData.slug}
    >
      {editor}
    </template.PreviewLayout>
  );
}
