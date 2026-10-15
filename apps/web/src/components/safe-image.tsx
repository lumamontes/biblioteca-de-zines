"use client";

import { useEffect, useState } from "react";

type SafeImageProps = Omit<React.ComponentPropsWithoutRef<"img">, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/zines.png",
  onError,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    // External catalogue URLs cannot be safely optimized by next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}
