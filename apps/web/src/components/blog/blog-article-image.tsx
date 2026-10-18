"use client";

import Image from "next/image";
import { useState } from "react";

interface BlogArticleImageProps {
  src: string;
  alt: string;
}

export default function BlogArticleImage({ src, alt }: BlogArticleImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return null;
  }

  return (
    <div className="relative w-full h-48 flex items-center justify-center bg-gray-100">
      <Image
        src={src}
        alt={alt}
        width={400}
        height={300}
        className="object-cover w-full h-full"
        loading="lazy"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

