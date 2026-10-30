"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import Link from "next/link";
import { Globe, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, GripVertical, AlertTriangle } from "lucide-react";
import Modal, { ModalType } from "@/components/ui/Modal";
import { getSiteTemplate, type SiteTemplate } from "@/components/templates";

interface Page {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  content?: unknown;
  meta?: unknown;
}

export default function WebsiteManagementPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [storeSlug, setStoreSlug] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  // classic 為 undefined；其他網站類型的差異都由 template 提供
  const [template, setTemplate] = useState<SiteTemplate | undefined>();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    description?: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "info", title: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [storeRes, pagesRes] = await Promise.all([
        authFetch("/api/v1/stores/me"),
        authFetch("/api/v1/pages"),
      ]);
      if (storeRes.ok) {
        const store = await storeRes.json();
        setStoreSlug(store.slug || "");
        setTemplate(getSiteTemplate(store.site_template));
      }
      if (pagesRes.ok) {
        const data = await pagesRes.json();
        setPages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSlug = (title: string) => {
    // Auto-generate a slug-friendly string from Chinese/English title
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    setNewSlug(autoSlug(val));
    setSlugError("");
  };

  const handleSlugChange = (val: string) => {
    setNewSlug(val);
    if (!(template?.slugPattern ?? /^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(val) && val !== "") {
      setSlugError(template?.slugHint ?? "Slug 只能包含小寫英文字母、數字和連字號，例如：about-us");
    } else if (val === "home") {
      setSlugError("保留字 'home' 專供系統首頁使用，請換一個名稱");
    } else {
      setSlugError("");
    }
  };

  const handleCreatePage = async () => {
    if (!newTitle.trim()) return;
    if (!newSlug.trim() || slugError) return;

    setIsCreating(true);
    try {
      const res = await authFetch("/api/v1/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), slug: newSlug.trim(), is_published: false, ...template?.newPage(newSlug.trim(), pages) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "建立失敗");
      }
      const newPage = await res.json();
      setPages([...pages, newPage]);
      setShowCreateForm(false);
      setNewTitle("");
      setNewSlug("");
      // Redirect to editor
      window.location.href = `/dashboard/website/${newPage.id}`;
    } catch (err: any) {
      setModalState({ isOpen: true, type: "error", title: "建立失敗", description: err.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePublish = async (page: Page) => {
    if (template && !page.is_published) {
      const errors = template.validatePage(page);
      if (errors.length) {
        setModalState({ isOpen: true, type: "error", title: "內容未填完，無法發佈", description: errors.join("；") });
        return;
      }
    }
    try {
      const res = await authFetch(`/api/v1/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !page.is_published }),
      });
      if (!res.ok) throw new Error();
      setPages(pages.map((p) => (p.id === page.id ? { ...p, is_published: !p.is_published } : p)));
    } catch {
      setModalState({ isOpen: true, type: "error", title: "操作失敗", description: "無法更新發佈狀態" });
    }
  };

  const handleDeletePage = (page: Page) => {
    setModalState({
      isOpen: true,
      type: "danger",
      title: `確定要刪除「${page.title}」？`,
      description: "此操作無法復原，該頁面將從品牌網站永久移除。",
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/v1/pages/${page.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          setPages(pages.filter((p) => p.id !== page.id));
          setModalState({ isOpen: false, type: "info", title: "" });
        } catch {
          setModalState({ isOpen: true, type: "error", title: "刪除失敗", description: "請稍後再試" });
        }
      },
    });
  };

  const publicPath = (s: string) => template?.publicPath?.(s) ?? `/${storeSlug}${s === "home" ? "" : `/${s}`}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">網站管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            新增和管理您品牌網站的自訂頁面，發佈後將自動出現在導覽列中。
          </p>
        </div>
        <div className="flex items-center gap-3">
          {storeSlug && (
            <a
              href={publicPath("home")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2 text-slate-400" />
              查看品牌頁
            </a>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增頁面
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">新增頁面</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">頁面名稱</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 px-4"
                placeholder="例如：關於我們"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL Slug{" "}
                <span className="text-slate-400 font-normal">
                  （網址：{template ? "/" : `/${storeSlug}/`}<strong>{newSlug || "..."}</strong>）
                </span>
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`block w-full rounded-xl border shadow-sm focus:ring-blue-500 sm:text-sm h-11 px-4 ${
                  slugError ? "border-red-400 focus:border-red-400" : "border-slate-300 focus:border-blue-500"
                }`}
                placeholder="例如：about-us"
              />
              {template && !slugError && <p className="mt-1 text-xs text-slate-400">{template.slugHint}</p>}
              {slugError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />{slugError}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreatePage}
              disabled={isCreating || !newTitle.trim() || !newSlug.trim() || !!slugError}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isCreating ? "建立中..." : "建立並進入編輯"}
            </button>
            <button
              onClick={() => { setShowCreateForm(false); setNewTitle(""); setNewSlug(""); setSlugError(""); }}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">尚未建立任何自訂頁面</p>
            <p className="text-sm text-slate-400 mt-1">點擊「新增頁面」開始建立您的品牌網站內容</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">頁面名稱</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">URL Slug</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">
                      {page.title}
                      {page.slug === "home" && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          系統預設首頁
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 sm:hidden">
                      {publicPath(page.slug)}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <code className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      {publicPath(page.slug)}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      page.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {page.is_published ? "已發佈" : "草稿"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(page)}
                        disabled={page.slug === "home"}
                        className={`p-2 rounded-lg transition-colors ${
                          page.slug === "home" 
                            ? "text-slate-300 cursor-not-allowed" 
                            : page.is_published
                              ? "text-green-600 hover:bg-green-50"
                              : "text-slate-400 hover:bg-slate-100"
                        }`}
                        title={page.slug === "home" ? "首頁必定公開" : page.is_published ? "取消發佈" : "發佈"}
                      >
                        {page.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      {storeSlug && page.is_published && (
                        <a
                          href={publicPath(page.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="在新分頁預覽"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/dashboard/website/${page.id}`}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {page.slug !== "home" ? (
                        <button
                          onClick={() => handleDeletePage(page)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="w-8" /> 
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info callout */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-blue-800 mb-1">💡 頁面如何運作？</p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>「草稿」狀態的頁面不會顯示在導覽列，也無法公開瀏覽。</li>
          <li>「已發佈」的頁面會自動加入品牌頁面的導覽列，並可公開訪問。</li>
          <li>您可以使用 Jodit 富文本編輯器，插入圖片、表格、影片等豐富內容。</li>
        </ul>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        description={modalState.description}
        onConfirm={modalState.onConfirm}
      />
    </div>
  );
}
