"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Update } from "@/content/update-types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function PublicUpdate({ update }: { update: Update }) {
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string }>();

  useEffect(() => {
    if (!expandedImage) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedImage(undefined);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [expandedImage]);

  if (!update.public) return null;

  return (
    <article className="border-t border-neutral-200 py-8 first:border-t-0 first:pt-0">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <time dateTime={update.date} className="text-sm text-neutral-500">
          {formatDate(update.date)}
        </time>
      </div>
      <h2 className="mb-3 text-2xl font-bold">{update.public.title}</h2>
      <p className="mb-4 text-lg leading-relaxed">{update.public.summary}</p>
      <div className="space-y-3 leading-relaxed text-neutral-700">
        {update.public.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {update.public.media && update.public.media.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {update.public.media.map((media, index) =>
            media.kind === "image" ? (
              <figure
                key={media.src}
                className={index === 0 ? "col-span-2 sm:col-span-3" : ""}
              >
                <a
                  href={media.src}
                  aria-label={`Ampliar imagem: ${media.alt}`}
                  className="block cursor-zoom-in"
                  onClick={(event) => {
                    event.preventDefault();
                    setExpandedImage({ src: media.src, alt: media.alt });
                  }}
                >
                  <Image
                    src={media.src}
                    alt={media.alt}
                    width={1200}
                    height={900}
                    sizes={
                      index === 0
                        ? "(max-width: 640px) 100vw, 768px"
                        : "(max-width: 640px) 50vw, 33vw"
                    }
                    className={`w-full bg-neutral-50 object-contain transition-opacity hover:opacity-85 ${
                      index === 0 ? "max-h-[38rem]" : "aspect-square"
                    }`}
                  />
                </a>
                {media.caption && (
                  <figcaption className="mt-1 text-xs text-neutral-500">
                    {media.caption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <figure
                key={media.src}
                className={index === 0 ? "col-span-2 sm:col-span-3" : ""}
              >
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full bg-black"
                  aria-label={media.alt}
                  src={media.src}
                >
                  Seu navegador não consegue reproduzir este vídeo.
                </video>
                <figcaption className="mt-1 text-xs text-neutral-500">
                  {media.alt}
                </figcaption>
              </figure>
            ),
          )}
        </div>
      )}
      {update.public.sourceUrl && (
        <Link
          href={update.public.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block text-sm underline"
        >
          {update.public.sourceLabel ?? "Ver publicação original"}
        </Link>
      )}
      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={expandedImage.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            aria-label="Fechar imagem ampliada"
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setExpandedImage(undefined)}
          />
          <div className="relative z-10 max-h-full max-w-5xl">
            <Image
              src={expandedImage.src}
              alt={expandedImage.alt}
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto object-contain"
            />
            <button
              type="button"
              aria-label="Fechar imagem ampliada"
              className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-lg leading-none text-black"
              onClick={() => setExpandedImage(undefined)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
