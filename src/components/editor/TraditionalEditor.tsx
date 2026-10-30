"use client";

import React, { useRef, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiUrl, authFetch } from '@/lib/api';
import ImageCropModal from './ImageCropModal';

// dynamically import Jodit to prevent SSR window issues
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp';

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await authFetch('/api/v1/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || '圖片上傳失敗');
  }
  return res.json();
}

export default function TraditionalEditor({
  initialContent,
  onChange,
}: {
  initialContent?: string;
  onChange: (html: string) => void;
}) {
  const editor = useRef(null);
  // 開啟裁切視窗時記住是哪個編輯器實例，插入時要回到原本的游標位置
  const joditRef = useRef<any>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const closeCrop = () => {
    joditRef.current?.s.restore();
    setCropFile(null);
  };

  const insertUploadedImage = async (file: File) => {
    const url = await uploadImage(file);
    const jodit = joditRef.current;
    jodit?.s.restore();
    jodit?.s.insertImage(url);
    setCropFile(null);
  };

  const config = useMemo(() => ({
    readonly: false,
    placeholder: '開始撰寫文章...',
    minHeight: 600,
    language: 'zh_tw',
    // 拖曳或貼上的圖片直接上傳到後端 /api/v1/upload，文章內只存網址，避免 Base64 撐大 HTML 與 Markdown
    uploader: {
      url: apiUrl('/api/v1/upload'),
      headers: {
        Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('geo_token') : ''}`,
      },
      filesVariableName: () => 'file',
      format: 'json',
      // 後端成功時直接回傳圖片網址字串，失敗時回傳 { detail }
      isSuccess: (resp: any) => typeof resp === 'string',
      getMessage: (resp: any) => resp?.detail || '圖片上傳失敗',
      process: (resp: any) => ({
        files: typeof resp === 'string' ? [resp] : [],
        path: '',
        baseurl: '',
        error: typeof resp === 'string' ? 0 : 1,
        msg: resp?.detail || '',
      }),
      defaultHandlerSuccess(this: any, data: { files: string[] }) {
        const jodit = this.j || this;
        data.files.forEach((url) => jodit.s.insertImage(url));
      },
    },
    // 工具列的插入圖片：選檔後先裁切再上傳
    controls: {
      cropImage: {
        icon: 'image',
        tooltip: '插入圖片',
        exec: (jodit: any) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = ACCEPTED_IMAGE_TYPES;
          input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            joditRef.current = jodit;
            jodit.s.save();
            if (file.type === 'image/gif') {
              // 裁切會失去 GIF 動畫，直接上傳原檔
              insertUploadedImage(file).catch((err) => {
                jodit.s.restore();
                jodit.message?.error?.(err.message);
              });
              return;
            }
            setCropFile(file);
          };
          input.click();
        },
      },
    },
    // 開啟完整功能
    buttons: [
      'source', '|',
      'bold', 'strikethrough', 'underline', 'italic', '|',
      'ul', 'ol', '|',
      'outdent', 'indent',  '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'cropImage', 'video', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'copyformat', '|',
      'symbol', 'fullsize', 'print', 'about'
    ]
  }), []);

  return (
    <div className="h-full w-full">
      <JoditEditor
        ref={editor}
        value={initialContent || ''}
        config={config}
        onBlur={newContent => onChange(newContent)}
        onChange={newContent => onChange(newContent)}
      />
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onCancel={closeCrop}
          onConfirm={insertUploadedImage}
        />
      )}
    </div>
  );
}
