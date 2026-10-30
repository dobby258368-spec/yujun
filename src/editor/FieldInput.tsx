"use client";

// 依 registry 的欄位定義產生表單控制項。外觀沿用 GEO 後台（Tailwind slate 色系、rounded-xl）
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { Field } from "@/blocks/registry";
import { imageUrl } from "@/lib/image";

export interface FieldContext {
  onUploadImage?: (file: File) => Promise<string>;
  /** service_keys 欄位的選項：服務代號與名稱 */
  serviceOptions: { key: string; label: string }[];
}

type Data = Record<string, unknown>;

export const inputClass = "w-full rounded-xl border border-slate-300 bg-white h-10 px-3 text-sm focus:border-blue-500 focus:outline-none";
const textareaClass = "w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none";
const iconButton = "p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30";

/** 設定欄位值；空值直接拿掉，讓存出來的 JSON 保持乾淨 */
export function setKey(data: Data, key: string, value: unknown): Data {
  const next = { ...data };
  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) delete next[key];
  else next[key] = value;
  return next;
}

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const next = [...list];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
}

export function Fields({ fields, data, onChange, ctx }: { fields: Field[]; data: Data; onChange: (d: Data) => void; ctx: FieldContext }) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <FieldInput key={f.key} field={f} value={data[f.key]} onChange={(v) => onChange(setKey(data, f.key, v))} ctx={ctx} />
      ))}
    </div>
  );
}

function Label({ field }: { field: Field }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {field.label}
      {"required" in field && field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function FieldInput({ field, value, onChange, ctx }: { field: Field; value: unknown; onChange: (v: unknown) => void; ctx: FieldContext }) {
  switch (field.type) {
    case "text":
      return (
        <div>
          <Label field={field} />
          <input type="text" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
        </div>
      );

    case "textarea":
    case "html":
      return (
        <div>
          <Label field={field} />
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={field.type === "html" ? 8 : 4}
            className={field.type === "html" ? `${textareaClass} font-mono text-xs` : textareaClass}
          />
          {field.type === "html" && <p className="mt-1 text-xs text-slate-400">HTML。搬進 GEO 後改用 GEO 的圖文編輯器（TraditionalEditor）</p>}
        </div>
      );

    case "number":
      return (
        <div>
          <Label field={field} />
          <input
            type="number"
            value={value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            className={`${inputClass} max-w-40`}
          />
        </div>
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked || undefined)} className="h-4 w-4 rounded" />
          {field.label}
        </label>
      );

    case "select": {
      const index = field.options.findIndex((o) => o.value === value);
      return (
        <div>
          <Label field={field} />
          <select
            value={index < 0 ? "" : String(index)}
            onChange={(e) => {
              const o = field.options[Number(e.target.value)];
              onChange(o?.value === "" ? undefined : o?.value);
            }}
            className={inputClass}
          >
            {index < 0 && !field.options.some((o) => o.value === "") && <option value="">（未選）</option>}
            {field.options.map((o, i) => (
              <option key={i} value={String(i)}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    }

    case "link": {
      const l = (value as { label?: string; href?: string }) ?? {};
      const update = (k: "label" | "href", v: string) => {
        const next = { label: l.label ?? "", href: l.href ?? "", [k]: v };
        onChange(next.label || next.href ? next : undefined);
      };
      return (
        <div>
          <Label field={field} />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="文字" value={l.label ?? ""} onChange={(e) => update("label", e.target.value)} className={inputClass} />
            <input type="text" placeholder="連結（例：/contact/）" value={l.href ?? ""} onChange={(e) => update("href", e.target.value)} className={inputClass} />
          </div>
        </div>
      );
    }

    case "image":
      return <ImageInput field={field} value={(value as string) ?? ""} onChange={onChange} ctx={ctx} />;

    case "strings": {
      const list = (value as string[]) ?? [];
      return (
        <div>
          <Label field={field} />
          <div className="space-y-2">
            {list.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <input type="text" value={s} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} className={inputClass} />
                <button type="button" onClick={() => onChange(move(list, i, -1))} disabled={i === 0} className={iconButton}><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => onChange(move(list, i, 1))} disabled={i === list.length - 1} className={iconButton}><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => onChange([...list, ""])} className="text-sm text-blue-600 hover:underline">+ 新增一行</button>
          </div>
        </div>
      );
    }

    case "list": {
      const list = (value as Data[]) ?? [];
      return (
        <div>
          <Label field={field} />
          <div className="space-y-3">
            {list.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onChange(move(list, i, -1))} disabled={i === 0} className={iconButton}><ArrowUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => onChange(move(list, i, 1))} disabled={i === list.length - 1} className={iconButton}><ArrowDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <Fields fields={field.fields} data={item} onChange={(d) => onChange(list.map((x, j) => (j === i ? d : x)))} ctx={ctx} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange([...list, {}])}
              className="w-full flex items-center justify-center py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-blue-600"
            >
              <Plus className="w-4 h-4 mr-1" /> 新增項目
            </button>
          </div>
        </div>
      );
    }

    case "object": {
      if (value === undefined) {
        return (
          <button type="button" onClick={() => onChange({})} className="text-sm text-blue-600 hover:underline">
            + 加入{field.label}
          </button>
        );
      }
      return (
        <fieldset className="p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <legend className="text-sm font-medium text-slate-700">{field.label}</legend>
            <button type="button" onClick={() => onChange(undefined)} className="text-xs text-red-500 hover:underline">移除</button>
          </div>
          <Fields fields={field.fields} data={value as Data} onChange={onChange} ctx={ctx} />
        </fieldset>
      );
    }

    case "service_keys": {
      const keys = (value as string[]) ?? [];
      return (
        <div>
          <Label field={field} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {ctx.serviceOptions.map((o) => (
              <label key={o.key} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={keys.includes(o.key)}
                  onChange={(e) => onChange(e.target.checked ? [...keys, o.key] : keys.filter((k) => k !== o.key))}
                  className="h-4 w-4 rounded"
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>
      );
    }
  }
}

function ImageInput({ field, value, onChange, ctx }: { field: Field; value: string; onChange: (v: unknown) => void; ctx: FieldContext }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <Label field={field} />
      <div className="flex gap-3 items-start">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- 編輯器縮圖，不經 next/image
          <img src={imageUrl(value)} alt="" className="h-16 w-24 shrink-0 object-cover rounded-lg border border-slate-200" />
        ) : (
          <div className="h-16 w-24 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">無圖片</div>
        )}
        <div className="flex-1 space-y-2">
          <input type="text" placeholder="圖片網址" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
          {ctx.onUploadImage && (
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              disabled={uploading}
              className="text-xs"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file || !ctx.onUploadImage) return;
                setUploading(true);
                setError("");
                try {
                  onChange(await ctx.onUploadImage(file));
                } catch (err) {
                  setError(err instanceof Error ? err.message : "上傳失敗");
                } finally {
                  setUploading(false);
                }
              }}
            />
          )}
          {uploading && <p className="text-xs text-slate-500">上傳中…</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
