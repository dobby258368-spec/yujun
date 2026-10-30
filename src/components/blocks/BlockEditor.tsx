"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { Plus, GripVertical, Trash2, Image as ImageIcon, AlignLeft, LayoutTemplate, BarChart3, GripHorizontal, MousePointerClick, Rss, Contact } from "lucide-react";

export type BlockType = "hero" | "text" | "image_text" | "stats" | "cards" | "cta" | "dynamic_posts" | "dynamic_contact";

export interface PageBlock {
  id: string;
  type: string; // classic 為 BlockType，其他網站類型由 extension 定義
  data: any;
}

// 其他網站類型的區塊：選單、預設值、表單由它提供，外框與操作和 classic 共用
export interface BlockEditorExtension {
  blockTypes: { type: string; label: string; icon: ComponentType<{ className?: string }>; desc: string }[];
  getDefaultData: (type: string) => any;
  renderForm: (block: PageBlock, onChange: (data: any) => void, onUploadImage?: (file: File) => Promise<string>) => ReactNode;
}

interface BlockEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  onUploadImage?: (file: File) => Promise<string>;
  extension?: BlockEditorExtension;
}

const BLOCK_TYPES = [
  { type: "hero", label: "大標題橫幅", icon: LayoutTemplate, desc: "全寬首圖與大標題" },
  { type: "text", label: "文字段落", icon: AlignLeft, desc: "純文字說明與段落" },
  { type: "image_text", label: "圖文並排", icon: ImageIcon, desc: "左圖右文或右圖左文" },
  { type: "stats", label: "數字成就", icon: BarChart3, desc: "數據與亮點展示" },
  { type: "cards", label: "多欄卡片", icon: GripHorizontal, desc: "產品或服務特色陣列" },
  { type: "cta", label: "行動呼籲", icon: MousePointerClick, desc: "引導點擊的橫幅" },
  { type: "dynamic_posts", label: "最新文章", icon: Rss, desc: "動態抓取最新文章" },
  { type: "dynamic_contact", label: "聯絡資訊", icon: Contact, desc: "動態讀取全站聯絡資訊" },
];

export default function BlockEditor({ blocks, onChange, onUploadImage, extension }: BlockEditorProps) {
  const blockTypes = extension?.blockTypes ?? BLOCK_TYPES;
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addBlock = (type: string) => {
    const newBlock: PageBlock = {
      id: Math.random().toString(36).substring(7),
      type,
      data: extension ? extension.getDefaultData(type) : getDefaultData(type as BlockType),
    };
    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const updateBlock = (id: string, newData: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data: newData } : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    onChange(newBlocks);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, field: string) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      try {
        const url = await onUploadImage(file);
        const block = blocks.find(b => b.id === blockId);
        if (block) {
          updateBlock(blockId, { ...block.data, [field]: url });
        }
      } catch (err) {
        alert("上傳失敗");
      }
    }
  };

  return (
    <div className="space-y-6">
      {blocks.length === 0 && !showAddMenu && (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500 mb-4">此頁面尚無內容區塊</p>
          <button
            onClick={() => setShowAddMenu(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-1" /> 新增第一個區塊
          </button>
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm relative group">
          {/* Block Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded">
                #{index + 1}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {blockTypes.find(t => t.type === block.type)?.label || block.type}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                ↓
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1" />
              <button
                onClick={() => removeBlock(block.id)}
                className="p-1.5 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Block Content Editor */}
          <div className="p-5">
            {extension?.renderForm(block, (data) => updateBlock(block.id, data), onUploadImage)}

            {block.type === "hero" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">主標題</label>
                    <input type="text" value={block.data.title || ""} onChange={e => updateBlock(block.id, { ...block.data, title: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">副標題</label>
                    <input type="text" value={block.data.subtitle || ""} onChange={e => updateBlock(block.id, { ...block.data, subtitle: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">按鈕文字 (選填)</label>
                    <input type="text" value={block.data.btn_text || ""} onChange={e => updateBlock(block.id, { ...block.data, btn_text: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">按鈕連結 (選填)</label>
                    <input type="text" value={block.data.btn_link || ""} onChange={e => updateBlock(block.id, { ...block.data, btn_link: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">背景圖片</label>
                  <div className="flex gap-4 items-center">
                    {block.data.image_url && <img src={block.data.image_url} alt="" className="h-16 w-32 object-cover rounded-lg" />}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, block.id, "image_url")} className="text-sm" />
                  </div>
                </div>
              </div>
            )}

            {block.type === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">小標題 (選填)</label>
                  <input type="text" value={block.data.heading || ""} onChange={e => updateBlock(block.id, { ...block.data, heading: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">內文</label>
                  <textarea value={block.data.content || ""} onChange={e => updateBlock(block.id, { ...block.data, content: e.target.value })} className="w-full rounded-xl border-slate-300 p-3 h-32" />
                </div>
              </div>
            )}

            {block.type === "image_text" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">小標題</label>
                    <input type="text" value={block.data.heading || ""} onChange={e => updateBlock(block.id, { ...block.data, heading: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">圖片位置</label>
                    <select value={block.data.image_position || "left"} onChange={e => updateBlock(block.id, { ...block.data, image_position: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3">
                      <option value="left">左圖右文</option>
                      <option value="right">右圖左文</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">內文</label>
                  <textarea value={block.data.content || ""} onChange={e => updateBlock(block.id, { ...block.data, content: e.target.value })} className="w-full rounded-xl border-slate-300 p-3 h-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">上傳圖片</label>
                  <div className="flex gap-4 items-center">
                    {block.data.image_url && <img src={block.data.image_url} alt="" className="h-16 w-16 object-cover rounded-lg" />}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, block.id, "image_url")} className="text-sm" />
                  </div>
                </div>
              </div>
            )}

            {block.type === "stats" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">標題</label>
                  <input type="text" value={block.data.heading || ""} onChange={e => updateBlock(block.id, { ...block.data, heading: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(block.data.items || []).map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <input type="text" placeholder="數字 (例: 100+)" value={item.value || ""} onChange={e => {
                        const newItems = [...block.data.items];
                        newItems[i].value = e.target.value;
                        updateBlock(block.id, { ...block.data, items: newItems });
                      }} className="w-full rounded-lg border-slate-300 text-sm mb-2" />
                      <input type="text" placeholder="標籤 (例: 企業客戶)" value={item.label || ""} onChange={e => {
                        const newItems = [...block.data.items];
                        newItems[i].label = e.target.value;
                        updateBlock(block.id, { ...block.data, items: newItems });
                      }} className="w-full rounded-lg border-slate-300 text-sm" />
                      <button onClick={() => {
                        const newItems = block.data.items.filter((_: any, idx: number) => idx !== i);
                        updateBlock(block.id, { ...block.data, items: newItems });
                      }} className="mt-2 text-xs text-red-500 hover:underline">移除</button>
                    </div>
                  ))}
                  {(!block.data.items || block.data.items.length < 4) && (
                    <button onClick={() => {
                      const newItems = [...(block.data.items || []), { value: "", label: "" }];
                      updateBlock(block.id, { ...block.data, items: newItems });
                    }} className="flex items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
                      + 新增數據
                    </button>
                  )}
                </div>
              </div>
            )}

            {block.type === "cards" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">區塊標題</label>
                  <input type="text" value={block.data.heading || ""} onChange={e => updateBlock(block.id, { ...block.data, heading: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                </div>
                <div className="space-y-3">
                  {(block.data.items || []).map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-4">
                      <div className="shrink-0 w-24">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-24 h-24 object-cover rounded-lg" />
                        ) : (
                          <div className="w-24 h-24 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">無圖片</div>
                        )}
                        <input type="file" accept="image/*" className="text-xs mt-2 w-full" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && onUploadImage) {
                            try {
                              const url = await onUploadImage(file);
                              const newItems = [...block.data.items];
                              newItems[i].image_url = url;
                              updateBlock(block.id, { ...block.data, items: newItems });
                            } catch (err) {}
                          }
                        }} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="text" placeholder="卡片標題" value={item.title || ""} onChange={e => {
                          const newItems = [...block.data.items];
                          newItems[i].title = e.target.value;
                          updateBlock(block.id, { ...block.data, items: newItems });
                        }} className="w-full rounded-lg border-slate-300 text-sm h-8 px-2" />
                        <textarea placeholder="卡片描述" value={item.description || ""} onChange={e => {
                          const newItems = [...block.data.items];
                          newItems[i].description = e.target.value;
                          updateBlock(block.id, { ...block.data, items: newItems });
                        }} className="w-full rounded-lg border-slate-300 text-sm p-2 h-16" />
                      </div>
                      <button onClick={() => {
                        const newItems = block.data.items.filter((_: any, idx: number) => idx !== i);
                        updateBlock(block.id, { ...block.data, items: newItems });
                      }} className="shrink-0 text-red-500 hover:text-red-700 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!block.data.items || block.data.items.length < 6) && (
                    <button onClick={() => {
                      const newItems = [...(block.data.items || []), { title: "", description: "", image_url: "" }];
                      updateBlock(block.id, { ...block.data, items: newItems });
                    }} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
                      + 新增卡片
                    </button>
                  )}
                </div>
              </div>
            )}

            {block.type === "cta" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">標題</label>
                  <input type="text" value={block.data.title || ""} onChange={e => updateBlock(block.id, { ...block.data, title: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">副標題</label>
                  <input type="text" value={block.data.subtitle || ""} onChange={e => updateBlock(block.id, { ...block.data, subtitle: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">按鈕文字</label>
                  <input type="text" value={block.data.btn_text || ""} onChange={e => updateBlock(block.id, { ...block.data, btn_text: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">按鈕連結</label>
                  <input type="text" value={block.data.btn_link || ""} onChange={e => updateBlock(block.id, { ...block.data, btn_link: e.target.value })} className="w-full rounded-xl border-slate-300 h-10 px-3" />
                </div>
              </div>
            )}

            {block.type === "dynamic_posts" && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium flex items-center">
                <Rss className="w-5 h-5 mr-2" />
                此區塊將在前台自動顯示最新的 6 篇文章。
              </div>
            )}
            
            {block.type === "dynamic_contact" && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium flex items-center">
                <Contact className="w-5 h-5 mr-2" />
                此區塊將在前台自動顯示您在「基本設定」中填寫的聯絡資訊與社群連結。
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Block Menu */}
      <div className="relative">
        {showAddMenu ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {blockTypes.map(bt => (
              <button
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                className="flex flex-col items-center p-4 text-center border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <bt.icon className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-semibold text-slate-800">{bt.label}</span>
                <span className="text-xs text-slate-500 mt-1">{bt.desc}</span>
              </button>
            ))}
            <div className="col-span-full pt-2 border-t border-slate-100 text-center">
              <button onClick={() => setShowAddMenu(false)} className="text-sm text-slate-500 hover:text-slate-800">取消</button>
            </div>
          </div>
        ) : (
          blocks.length > 0 && (
            <button
              onClick={() => setShowAddMenu(true)}
              className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center justify-center font-medium"
            >
              <Plus className="w-5 h-5 mr-2" /> 新增內容區塊
            </button>
          )
        )}
      </div>
    </div>
  );
}

function getDefaultData(type: BlockType) {
  switch (type) {
    case "hero": return { title: "大標題", subtitle: "副標題說明...", image_url: "", btn_text: "了解更多", btn_link: "#" };
    case "text": return { heading: "段落標題", content: "在這裡輸入您的文字內容..." };
    case "image_text": return { heading: "圖文標題", content: "說明文字...", image_url: "", image_position: "left" };
    case "stats": return { heading: "我們的成就", items: [{ label: "滿意度", value: "99%" }, { label: "客戶數", value: "500+" }] };
    case "cards": return { heading: "我們的服務", items: [{ title: "服務A", description: "說明...", image_url: "" }] };
    case "cta": return { title: "準備好開始了嗎？", subtitle: "立即與我們聯繫", btn_text: "聯絡我們", btn_link: "#" };
    case "dynamic_posts": return {};
    case "dynamic_contact": return {};
    default: return {};
  }
}
