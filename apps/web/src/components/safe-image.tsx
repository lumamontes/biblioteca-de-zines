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

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
    onError?.(event);
  };

  const referrerPolicy = currentSrc.startsWith("https://drive.google.com/thumbnail?")
    ? "no-referrer"
    : props.referrerPolicy;

  return (
    // External catalogue URLs should be loaded directly, without leaking the
    // page URL to providers that may reject local development referrers.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      referrerPolicy={referrerPolicy}
      onError={handleError}
    />
  );
}
