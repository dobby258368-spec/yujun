// GEO 上傳的圖片存成 /uploads/... 的相對路徑。讀 GEO API 時設定 NEXT_PUBLIC_GEO_PUBLIC_URL，
// 圖片就改從 GEO 的網域取；本機內容的圖片放在 public/uploads/，不必設定
export function imageUrl(src: string) {
  const base = process.env.NEXT_PUBLIC_GEO_PUBLIC_URL;
  return base && src.startsWith("/uploads/") ? `${base}${src}` : src;
}
