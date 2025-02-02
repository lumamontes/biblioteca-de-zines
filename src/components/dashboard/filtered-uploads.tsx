'use client';
import { useState } from "react";
import { UploadPreview } from "./upload-preview";
import Button from "../button";
import { Tables } from "../../../database.types";
import { Zine } from "@/@types/zine";

export const FilteredUploads = ({
  uploads,
  publishedZines,
}: {
  uploads: Tables<'form_uploads'>[];
  publishedZines: Zine[];
}) => {
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">(
    "all"
  );
  const filteredUploads = uploads.filter((upload) => {
    const isPublished = publishedZines.some(
      (zine) => zine.title === upload.title && zine.is_published
    );
    if (filter === "published") return isPublished;
    if (filter === "unpublished") return !isPublished;
    return true;
  });

  return (
    <section className="mt-8">
      <div className="flex gap-4">
        <Button
          onClick={() => setFilter("all")}
          className={`py-2 rounded-md transition ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Todas
        </Button>
        <Button
          onClick={() => setFilter("published")}
          className={`py-2 rounded-md transition ${
            filter === "published"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Publicadas
        </Button>
        <Button
          onClick={() => setFilter("unpublished")}
          className={`py-2 rounded-md transition ${
            filter === "unpublished"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Não Publicadas
        </Button>
      </div>

      {filteredUploads.length === 0 ? (
        <p className="text-gray-500 mt-4">Nenhuma zine encontrada.</p>
      ) : (
        <div className="flex flex-col mt-6 space-y-4">
          {filteredUploads.map((upload) => {
            const publishedZine = publishedZines.find(
              (zine) => zine.title === upload.title
            );
            return (
              <UploadPreview
                key={upload.id}
                upload={upload}
                publishedZine={publishedZine}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
