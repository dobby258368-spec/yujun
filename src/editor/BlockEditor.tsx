"use client";

// yujun 類型的 block 編輯器。介面與外觀沿用 GEO 的 frontend/src/components/blocks/BlockEditor.tsx
// （blocks + onChange + onUploadImage），欄位表單由 registry 自動產生，搬進 GEO 後台時只要接上 API
import { useState } from "react";
import {
  AlignLeft, ArrowDown, ArrowUp, BookOpen, Building2, FileText, Grid2x2, HelpCircle, Images, LayoutGrid, Link2,
  ListChecks, ListOrdered, MapPin, Megaphone, Newspaper, Plus, Rows3, Tags, Trash2, Type,
} from "lucide-react";
import { BLOCKS } from "@/blocks/registry";
import type { Block, BlockType } from "@/blocks/types";
import { Fields, type FieldContext } from "./FieldInput";

const ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  hero_slider: Images,
  intro: AlignLeft,
  page_title: Type,
  mosaic: LayoutGrid,
  tile_grid: Grid2x2,
  note: Rows3,
  steps: ListOrdered,
  post_list: Newspaper,
  faq: HelpCircle,
  faq_by_service: HelpCircle,
  related_reading: BookOpen,
  related_services: Tags,
  service_links: Link2,
  case_links: ListChecks,
  rich_section: FileText,
  company_info: Building2,
  contact_panel: MapPin,
  contact_cta: Megaphone,
};

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  onUploadImage?: (file: File) => Promise<string>;
  serviceOptions?: FieldContext["serviceOptions"];
}

export default function BlockEditor({ blocks, onChange, onUploadImage, serviceOptions = [] }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const ctx: FieldContext = { onUploadImage, serviceOptions };

  const addBlock = (type: BlockType) => {
    onChange([...blocks, { id: crypto.randomUUID(), type, data: BLOCKS[type].defaults() } as Block]);
    setShowAddMenu(false);
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, data } as Block) : b)));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-6">
      {blocks.length === 0 && !showAddMenu && (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500 mb-4">此頁面尚無內容區塊</p>
          <button onClick={() => setShowAddMenu(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-1" /> 新增第一個區塊
          </button>
        </div>
      )}

      {blocks.map((block, index) => {
        const def = BLOCKS[block.type];
        return (
          <div key={block.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded">#{index + 1}</span>
                <span className="text-sm font-semibold text-slate-700">{def.label}</span>
                <span className="text-xs text-slate-400 hidden xl:inline">{def.desc}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveBlock(index, -1)} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button onClick={() => removeBlock(block.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-5">
              {def.fields.length ? (
                <Fields fields={def.fields} data={block.data as Record<string, unknown>} onChange={(d) => updateBlock(block.id, d)} ctx={ctx} />
              ) : (
                <p className="text-sm text-slate-400">此區塊自動產生內容，不需要設定。</p>
              )}
            </div>
          </div>
        );
      })}

      <div className="relative">
        {showAddMenu ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(BLOCKS) as BlockType[]).map((type) => {
              const Icon = ICONS[type];
              return (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex flex-col items-center p-4 text-center border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Icon className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-semibold text-slate-800">{BLOCKS[type].label}</span>
                  <span className="text-xs text-slate-500 mt-1">{BLOCKS[type].desc}</span>
                </button>
              );
            })}
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
