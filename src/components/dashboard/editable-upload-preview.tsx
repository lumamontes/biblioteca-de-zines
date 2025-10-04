"use client";

import Image from "next/image";
import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../button";
import Link from "next/link";
import { getThumbnailUrl } from "@/utils/assets";
import { Tables } from "@/types/database.types";
import {
  publishZine,
  unpublishZine,
  updatePublishedZine,
  updateUpload,
} from "@/app/(admin)/dashboard/actions";
import { Zine } from "@/@types/zine";
import { editUploadSchema, EditUploadFormData } from "@/schemas/edit-upload";
import { getCategories } from "@/services/categories-service";
import MultiSelect from "../ui/multi-select";
import { parseTags } from "@/utils/utils";
import { toast } from "sonner";

interface EditableUploadPreviewProps {
  upload: Tables<"form_uploads">;
  zine?: Zine;
}

export const EditableUploadPreview = ({ upload, zine }: EditableUploadPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const thumbnailUrl = upload.cover_image
    ? getThumbnailUrl(upload.cover_image)
    : "/placeholder.png";

  const existingTags = parseTags(upload.tags);
  const existingCategories = existingTags.categories || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditUploadFormData>({
    resolver: zodResolver(editUploadSchema),
    defaultValues: {
      slug: zine?.slug || "",
      title: upload.title,
      description: upload.description || "",
      collection_title: upload.collection_title || "",
      author_name: upload.author_name || "",
      author_url: upload.author_url || "",
      author_email: upload.author_email || "",
      pdf_url: upload.pdf_url || "",
      cover_image: upload.cover_image || "",
      published_year: upload.published_year || undefined,
      categories: existingCategories,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Erro ao carregar categorias");
      }
    };

    loadCategories();
  }, []);

  const onSubmit = async (data: EditUploadFormData) => {
    setIsLoading(true);
    const result = await updateUpload(upload.id, data);
    if (result.success) {
      toast.success(result.message);
      setIsEditing(false);
      reset(data);
    } else {
      toast.error(result.message);
    }
    setIsLoading(false)
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
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

        <div className="flex flex-col flex-grow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="hidden"
              {...register("slug")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("title")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da capa
            </label>
            <input
              {...register("cover_image")}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.cover_image && (
              <p className="text-red-500 text-sm mt-1">{errors.cover_image.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da coleção
              </label>
              <input
                {...register("collection_title")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano de publicação
              </label>
              <input
                {...register("published_year", { valueAsNumber: true })}
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.published_year && (
                <p className="text-red-500 text-sm mt-1">{errors.published_year.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do autor *
            </label>
            <input
              {...register("author_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.author_name && (
              <p className="text-red-500 text-sm mt-1">{errors.author_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL do autor
            </label>
            <input
              {...register("author_url")}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.author_url && (
              <p className="text-red-500 text-sm mt-1">{errors.author_url.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL do PDF
            </label>
            <input
              {...register("pdf_url")}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.pdf_url && (
              <p className="text-red-500 text-sm mt-1">{errors.pdf_url.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Categorias"
                  options={categories}
                  selectedValues={field.value || []}
                  onChange={field.onChange}
                  placeholder="Selecione categorias..."
                  maxSelections={3}
                />
              )}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 mt-4 sm:mt-0 sm:ml-4 min-w-[200px]">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white disabled:bg-gray-400"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            className="w-full bg-gray-500 text-white"
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div
      data-testid="upload-preview"
      className="flex flex-col sm:flex-row border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition gap-4"
    >
      <div className="flex-shrink-0">
        {zine?.is_published && zine?.slug ? (
          <Link href={`/zines/${zine.slug}`}>
            <Image
              src={thumbnailUrl}
              alt={`Capa da zine ${upload.title}`}
              width={120}
              height={120}
              className="rounded-md object-cover hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
        ) : (
          <Image
            src={thumbnailUrl}
            alt={`Capa da zine ${upload.title}`}
            width={120}
            height={120}
            className="rounded-md object-cover"
          />
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <p className="text-sm text-gray-500">{zine?.slug}</p>
        <h2 className="text-lg font-semibold">{upload.title}</h2>
        {upload.collection_title && (
          <p className="text-sm text-gray-600">{upload.collection_title}</p>
        )}
        {upload.published_year && (
          <p className="text-sm text-gray-600">Ano: {upload.published_year}</p>
        )}

        {upload.description && (
          <p className="mt-2 text-sm text-gray-700">{upload.description}</p>
        )}

        <p className="text-sm mt-2">
          Autor: {upload.author_name}
          {upload.author_url && (
            <>
              {" - "}
              <Link
                href={upload.author_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {upload.author_url}
              </Link>
            </>
          )}
          <br></br>
          {upload.author_email}
        </p>

        {upload.pdf_url && (
          <p className="text-sm mt-2">
            Link da zine:{" "}
            <Link
              href={upload.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {upload.pdf_url}
            </Link>
          </p>
        )}

        {existingCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {existingCategories.map((category) => (
              <span
                key={category}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-2 mt-4 sm:mt-0 sm:ml-4 min-w-[200px]">
        <Button
          onClick={() => setIsEditing(true)}
          className="w-full bg-blue-500 text-white"
        >
          Editar
        </Button>
        
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