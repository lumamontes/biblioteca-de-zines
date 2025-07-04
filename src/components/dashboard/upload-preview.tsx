"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import Button from "../button";
import Link from "next/link";
import { getThumbnailUrl } from "@/utils/assets";
import { Tables } from "@/types/database.types";
import {
  publishZine,
  unpublishZine,
  updatePublishedZine,
} from "@/app/(admin)/dashboard/actions";
import { Zine } from "@/@types/zine";

export const UploadPreview = ({
  upload,
  zine,
}: {
  upload: Tables<"form_uploads">;
  zine?: Zine;
}) => {
  const [isPending, startTransition] = useTransition();

  const [showFullDescription, setShowFullDescription] = useState(false);
  const thumbnailUrl = upload.cover_image
    ? getThumbnailUrl(upload.cover_image)
    : "/placeholder.png";

  return (
    <div
      data-testid="upload-preview"
      className="flex flex-col sm:flex-row border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition gap-4"
    >
      <div className="flex-shrink-0">
        <Image
          src={thumbnailUrl}
          alt={`Capa da zine ${upload.title}`}
          width={120}
          height={120}
          className="rounded-md object-cover"
        />
      </div>

      <div className="flex flex-col flex-grow">
        <p className="text-sm text-gray-500">{zine?.slug}</p>
        <h2 className="text-lg font-semibold">{upload.title}</h2>
        <p className="text-sm text-gray-600">{upload.collection_title}</p>

        {upload.description && (
          <p className="mt-2 text-sm text-gray-700">
            {showFullDescription
              ? upload.description
              : `${upload.description.slice(0, 100)}`}
            {!showFullDescription && upload.description.length > 100 && "..."}
            {upload.description.length > 100 && (
              <button
                className="text-blue-600 hover:underline ml-1"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </p>
        )}

        <p className="text-sm mt-2">
          Autor: {upload.author_name} -{" "}
          {upload.author_url ? (
            <Link
              href={upload.author_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {upload.author_url}
            </Link>
          ) : (
            upload.author_name
          )}
        </p>

        <p className="text-sm mt-2">
          Link da zine:{" "}
          {upload.pdf_url ? (
            <Link
              href={upload.pdf_url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {upload.pdf_url}
            </Link>
          ) : (
            "Sem link disponível"
          )}
        </p>
      </div>

      <div className="flex flex-col justify-center gap-2 mt-4 sm:mt-0 sm:ml-4 min-w-[200px]">
        {zine?.is_published && (
          <Button asChild className="w-full">
            <Link href={`/zines/${zine?.slug}`}>Ver no site</Link>
          </Button>
        )}
        {zine?.is_published ? (
          <Button
            onClick={() => startTransition(() => unpublishZine(zine.id))}
            disabled={isPending}
            className="py-2 w-full bg-red-500 text-white"
          >
            {isPending ? "Aguarde..." : "Despublicar"}
          </Button>
        ) : (
          <Button
            onClick={() =>
              startTransition(() =>
                zine?.slug
                  ? updatePublishedZine(zine.id)
                  : publishZine(upload.id)
              )
            }
            disabled={isPending}
            className="py-2 w-full bg-green-500 text-white"
          >
            {isPending ? "Aguarde..." : zine?.slug ? "Republicar" : "Publicar"}
          </Button>
        )}
      </div>
    </div>
  );
};
