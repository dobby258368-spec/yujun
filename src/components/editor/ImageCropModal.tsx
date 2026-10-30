"use client";

import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Loader2 } from 'lucide-react';

const ASPECT_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: '自由', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

// 輸出格式沿用原檔，其餘一律轉 JPEG；副檔名需符合後端白名單
const OUTPUT_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
};

function defaultCrop(width: number, height: number, aspect: number | undefined): Crop {
  if (!aspect) return { unit: '%', x: 0, y: 0, width: 100, height: 100 };
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height);
}

export default function ImageCropModal({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (cropped: File) => Promise<void>;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState('');
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = defaultCrop(width, height, aspect);
    setCrop(initial);
    setCompletedCrop(toPixelCrop(initial, width, height));
  };

  const handleAspectChange = (value: number | undefined) => {
    setAspect(value);
    const img = imgRef.current;
    if (!img) return;
    const next = defaultCrop(img.width, img.height, value);
    setCrop(next);
    setCompletedCrop(toPixelCrop(next, img.width, img.height));
  };

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !completedCrop?.width || !completedCrop?.height) return;
    setIsUploading(true);
    setError('');
    try {
      const cropped = await cropToFile(img, completedCrop, file);
      await onConfirm(cropped);
    } catch (err: any) {
      setError(err.message || '圖片上傳失敗');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">裁切圖片</h3>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4 flex flex-wrap gap-2">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAspectChange(opt.value)}
              disabled={isUploading}
              className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                aspect === opt.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-6 py-4 flex justify-center bg-white">
          {src && (
            <ReactCrop
              crop={crop}
              aspect={aspect}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              keepSelection
              disabled={isUploading}
            >
              <img
                ref={imgRef}
                src={src}
                alt="裁切預覽"
                onLoad={handleImageLoad}
                className="max-h-[60vh] w-auto"
              />
            </ReactCrop>
          )}
        </div>

        {error && <p className="px-6 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUploading || !completedCrop?.width || !completedCrop?.height}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            裁切並插入
          </button>
        </div>
      </div>
    </div>
  );
}

function toPixelCrop(crop: Crop, width: number, height: number): PixelCrop {
  if (crop.unit === 'px') return crop as PixelCrop;
  return {
    unit: 'px',
    x: (crop.x / 100) * width,
    y: (crop.y / 100) * height,
    width: (crop.width / 100) * width,
    height: (crop.height / 100) * height,
  };
}

// 裁切座標是以畫面上的顯示尺寸計算，輸出前換算回原圖像素
async function cropToFile(img: HTMLImageElement, crop: PixelCrop, original: File): Promise<File> {
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;
  const width = Math.round(crop.width * scaleX);
  const height = Math.round(crop.height * scaleY);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('瀏覽器不支援圖片裁切');
  ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, width, height, 0, 0, width, height);

  const type = OUTPUT_TYPES[original.type] ? original.type : 'image/jpeg';
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));
  if (!blob) throw new Error('圖片裁切失敗');

  const baseName = original.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}${OUTPUT_TYPES[type]}`, { type });
}
