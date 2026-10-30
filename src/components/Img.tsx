import Image from "next/image";
import { imageUrl } from "@/lib/image";

// 內容圖片：尺寸一律由 CSS 決定（object-fit / aspect-ratio），width/height 只是給 next/image 的佔位值
export default function Img({
  src,
  alt,
  sizes,
  loading,
  fetchPriority,
}: {
  src: string;
  alt: string;
  sizes: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "auto";
}) {
  return (
    <Image
      src={imageUrl(src)}
      alt={alt}
      width={1600}
      height={1200}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
}
