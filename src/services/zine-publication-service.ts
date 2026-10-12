import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/types/database.types';
import type { EditUploadFormData } from '@/schemas/edit-upload';
import type { ZineTags } from '@/@types/zine';
import { generateSlug } from '@/utils/slug';
import { parseTags } from '@/utils/utils';
import { flattenAuthors, parseUploadAuthors } from '@/utils/authors';
import { isGeneratedCover, isPlaceholderCover } from '@/utils/cover-image';
import { isCompleteGeneratedCover } from '@/application/cover-generation-policy';
import { syncAuthorsToZine } from './author-service';
import { dispatchZineProcessing } from './zine-processing-dispatch-service';
import { enqueueZineProcessing } from './enqueue-zine-processing';
import { createR2AssetStorage } from './r2-storage-service';

type ZineDatabaseClient = SupabaseClient<Database>;

export async function unpublishZine(
  supabase: ZineDatabaseClient,
  zineId: number,
): Promise<void> {
  const { error } = await supabase
    .from('library_zines')
    .update({ is_published: false })
    .eq('id', zineId);
  if (error) throw new Error(`Erro ao despublicar a zine: ${error.message}`);
}

export async function republishZine(
  supabase: ZineDatabaseClient,
  zineId: number,
): Promise<void> {
  const { data: zine, error: fetchError } = await supabase
    .from('library_zines')
    .select('pdf_url, cover_image')
    .eq('id', zineId)
    .single();
  if (fetchError) throw new Error(`Erro ao buscar zine: ${fetchError.message}`);

  const { error } = await supabase
    .from('library_zines')
    .update({ is_published: true })
    .eq('id', zineId);
  if (error) throw new Error(`Erro ao republicar a zine: ${error.message}`);

  if (zine.pdf_url && (isPlaceholderCover(zine.cover_image)
    || isGeneratedCover(zine.cover_image, zineId)
      && !(await hasCompleteGeneratedCover(supabase, zineId, zine.pdf_url)))) {
    await requestZineProcessing(zineId);
  }
}

export async function publishZineFromUpload(
  supabase: ZineDatabaseClient,
  uploadId: number,
): Promise<void> {
  const { data: upload, error: fetchError } = await supabase
    .from('form_uploads')
    .select('*')
    .eq('id', uploadId)
    .single();
  if (fetchError || !upload) throw new Error(`Erro ao buscar zine: ${fetchError?.message}`);

  const authors = parseUploadAuthors(upload);
  if (authors.length === 0) throw new Error('O nome do autor é obrigatório');

  const slug = generateSlug(authors[0].name, upload.title);
  const { data: existingZine } = await supabase
    .from('library_zines')
    .select('id, tags, source_upload_id, cover_image')
    .eq('slug', slug)
    .single();

  let zineId: number;
  let shouldProcess = false;
  if (!existingZine) {
    const { data: newZine, error } = await supabase
      .from('library_zines')
      .insert({
        title: upload.title,
        description: upload.description,
        collection_title: upload.collection_title,
        cover_image: upload.cover_image,
        pdf_url: upload.pdf_url,
        tags: upload.tags,
        is_published: true,
        import_status: 'pending',
        source_upload_id: uploadId,
        year: upload.published_year,
        slug,
      })
      .select('id')
      .single();
    if (error || !newZine) throw new Error(`Erro ao publicar a zine: ${error?.message}`);
    zineId = newZine.id;
    shouldProcess = Boolean(upload.pdf_url && isPlaceholderCover(upload.cover_image));
  } else {
    zineId = existingZine.id;
    shouldProcess = Boolean(upload.pdf_url && (
      isPlaceholderCover(existingZine.cover_image)
      || isGeneratedCover(existingZine.cover_image, zineId)
        && !(await hasCompleteGeneratedCover(supabase, zineId, upload.pdf_url))
    ));

    const existingTags = parseTags(existingZine.tags);
    const newTags = parseTags(upload.tags);
    const mergedTags: ZineTags = {
      ...existingTags,
      ...newTags,
      categories: Array.from(new Set([
        ...(existingTags.categories || []),
        ...(newTags.categories || []),
      ])),
    };

    const { error } = await supabase
      .from('library_zines')
      .update({
        tags: mergedTags as unknown as Json,
        pdf_url: upload.pdf_url,
        ...(shouldProcess ? { import_status: 'pending' } : {}),
        ...(existingZine.source_upload_id ? {} : { source_upload_id: uploadId }),
      })
      .eq('id', zineId);
    if (error) throw new Error(`Erro ao atualizar a zine: ${error.message}`);
  }

  await syncAuthorsToZine(supabase, zineId, authors);
  const { error: uploadError } = await supabase
    .from('form_uploads')
    .update({ is_published: true })
    .eq('id', uploadId);
  if (uploadError) throw new Error(`Erro ao marcar upload como publicado: ${uploadError.message}`);

  if (upload.pdf_url && shouldProcess) await requestZineProcessing(zineId);
}

export async function updateUploadAndPublishedZine(
  supabase: ZineDatabaseClient,
  uploadId: number,
  validatedData: EditUploadFormData,
): Promise<void> {
  const tags: ZineTags = { categories: validatedData.categories || [] };
  const tagsJson = tags as unknown as Json;
  const { author_name, author_url } = flattenAuthors(validatedData.authors);
  const nextPdfUrl = validatedData.pdf_url || null;

  const { data: currentUpload, error: currentUploadError } = await supabase
    .from('form_uploads')
    .select('cover_image')
    .eq('id', uploadId)
    .single();
  if (currentUploadError) throw new Error(`Erro ao buscar upload atual: ${currentUploadError.message}`);

  const publishedZine = validatedData.slug
    ? (await supabase
      .from('library_zines')
      .select('id, is_published, cover_image')
      .eq('slug', validatedData.slug)
      .single()).data
    : null;
  const { error: uploadError } = await supabase
    .from('form_uploads')
    .update({
      title: validatedData.title,
      description: validatedData.description || null,
      collection_title: validatedData.collection_title || null,
      author_name,
      author_url,
      pdf_url: nextPdfUrl,
      cover_image: validatedData.cover_image || null,
      published_year: validatedData.published_year || null,
      tags: tagsJson,
    })
    .eq('id', uploadId);
  if (uploadError) throw new Error(`Erro ao atualizar upload: ${uploadError.message}`);

  if (!validatedData.slug) return;

  const coverWasRemoved = Boolean(currentUpload.cover_image && !validatedData.cover_image);
  const nextCoverImage = validatedData.cover_image
    || (publishedZine?.cover_image && (
      isGeneratedCover(publishedZine.cover_image, publishedZine.id)
      || (!coverWasRemoved && !isPlaceholderCover(publishedZine.cover_image))
    )
      ? publishedZine.cover_image
      : null);
  const coverNeedsGeneration = Boolean(
    publishedZine
    && nextPdfUrl
    && (!nextCoverImage
      || isPlaceholderCover(nextCoverImage)
      || isGeneratedCover(nextCoverImage, publishedZine.id))
    && !(await hasCompleteGeneratedCover(supabase, publishedZine.id, nextPdfUrl)),
  );
  const { error: zineError } = await supabase
    .from('library_zines')
    .update({
      title: validatedData.title,
      description: validatedData.description || null,
      collection_title: validatedData.collection_title || null,
      pdf_url: nextPdfUrl,
      cover_image: nextCoverImage,
      year: validatedData.published_year || null,
      tags: tagsJson,
      ...(coverNeedsGeneration ? { import_status: 'pending' } : {}),
    })
    .eq('slug', validatedData.slug);
  if (zineError) throw new Error(`Erro ao atualizar zine: ${zineError.message}`);

  if (coverNeedsGeneration && publishedZine) await requestZineProcessing(publishedZine.id);
}

async function requestZineProcessing(zineId: number): Promise<void> {
  try {
    await enqueueZineProcessing(zineId);
    await dispatchZineProcessing();
  } catch (error) {
    console.error('Erro ao enfileirar processamento da zine:', error);
  }
}

async function hasCompleteGeneratedCover(
  supabase: ZineDatabaseClient,
  zineId: number,
  pdfUrl: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('library_zines')
    .select('cover_image, import_status, processed_pdf_url')
    .eq('id', zineId)
    .single();
  return !error
    && Boolean(data)
    && isCompleteGeneratedCover(data, zineId, pdfUrl)
    && await createR2AssetStorage().isCoverAvailable({ id: zineId, kind: 'zine' }, data.cover_image ?? '');
}
