import { generateSlug } from '@/utils/slug';
import { parseTags } from '@/utils/utils';
import { isPlaceholderCover } from '@/utils/cover-image';
import { isCompleteGeneratedCover } from '@/application/cover-generation/cover-generation-policy';
import { needsGeneratedCover, resolvePublishedCover } from '@/application/publication/cover-publication-policy';
import type {
  PublicationRecord,
  PublicationUpload,
  UpdateUploadInput,
  UploadUpdate,
  ZinePublicationDependencies,
} from '@/application/publication/zine-publication-types';

export function createZinePublicationService(deps: ZinePublicationDependencies) {
  return {
    async unpublishZine(zineId: number): Promise<void> {
      await deps.publications.setPublished(zineId, false);
    },

    async republishZine(zineId: number): Promise<void> {
      const zine = await requirePublication(deps, zineId);
      await deps.publications.setPublished(zineId, true);

      if (zine.pdfUrl && await needsCoverProcessing(deps, zine)) {
        await deps.processing.request(zineId);
      }
    },

    async publishZineFromUpload(uploadId: number): Promise<void> {
      const upload = await requireUpload(deps, uploadId);
      if (upload.authors.length === 0) throw new Error('O nome do autor é obrigatório');

      const slug = generateSlug(upload.authors[0].name, upload.title);
      const existingZine = await deps.publications.findBySlug(slug);
      const shouldProcess = existingZine
        ? await shouldProcessExistingPublication(deps, existingZine, upload.pdfUrl)
        : Boolean(upload.pdfUrl && isPlaceholderCover(upload.coverImage));

      const zineId = existingZine
        ? existingZine.id
        : await deps.publications.insert({
          title: upload.title,
          description: upload.description,
          collectionTitle: upload.collectionTitle,
          coverImage: upload.coverImage,
          pdfUrl: upload.pdfUrl,
          tags: upload.tags,
          publishedYear: upload.publishedYear,
          importStatus: shouldProcess ? 'pending' : 'completed',
          sourceUploadId: uploadId,
          slug,
        });

      if (existingZine) {
        await deps.publications.update(zineId, {
          tags: mergeTags(existingZine.tags, upload.tags),
          pdfUrl: upload.pdfUrl,
          importStatus: shouldProcess ? 'pending' : undefined,
        });
      }

      await deps.authors.sync(zineId, upload.authors);
      await deps.publications.markUploadPublished(uploadId);
      if (upload.pdfUrl && shouldProcess) await deps.processing.request(zineId);
    },

    async updateUploadAndPublishedZine(
      uploadId: number,
      input: UpdateUploadInput,
    ): Promise<void> {
      const currentUpload = await requireUpload(deps, uploadId);
      const nextUpload: UploadUpdate = {
        ...currentUpload,
        title: input.title,
        description: input.description || null,
        collectionTitle: input.collectionTitle || null,
        coverImage: input.coverImage || null,
        pdfUrl: input.pdfUrl || null,
        publishedYear: input.publishedYear || null,
        tags: { categories: input.categories || [] },
        authors: input.authors,
      };
      await deps.publications.updateUpload(uploadId, nextUpload);

      if (!input.slug) return;
      const publishedZine = await deps.publications.findBySlug(input.slug);
      if (!publishedZine) return;

      const nextCoverImage = resolvePublishedCover({
        submittedCoverImage: input.coverImage,
        currentCoverImage: publishedZine.coverImage,
        currentZineId: publishedZine.id,
        coverWasRemoved: Boolean(currentUpload.coverImage && !input.coverImage),
      });
      const coverNeedsGeneration = needsGeneratedCover({
        pdfUrl: input.pdfUrl || null,
        coverImage: nextCoverImage,
        zineId: publishedZine.id,
        hasCompleteGeneratedCover: await hasCompleteGeneratedCover(deps, publishedZine, input.pdfUrl || ''),
      });

      await deps.publications.update(publishedZine.id, {
        title: input.title,
        description: input.description || null,
        collectionTitle: input.collectionTitle || null,
        pdfUrl: input.pdfUrl || null,
        coverImage: nextCoverImage,
        publishedYear: input.publishedYear || null,
        tags: { categories: input.categories || [] },
        importStatus: coverNeedsGeneration ? 'pending' : undefined,
      });

      if (coverNeedsGeneration) await deps.processing.request(publishedZine.id);
    },
  };
}

async function requireUpload(
  deps: ZinePublicationDependencies,
  uploadId: number,
): Promise<PublicationUpload> {
  const upload = await deps.publications.findUpload(uploadId);
  if (!upload) throw new Error('Erro ao buscar zine: upload não encontrado');
  return upload;
}

async function requirePublication(
  deps: ZinePublicationDependencies,
  zineId: number,
): Promise<PublicationRecord> {
  const zine = await deps.publications.findById(zineId);
  if (!zine) throw new Error('Erro ao buscar zine: publicação não encontrada');
  return zine;
}

async function needsCoverProcessing(
  deps: ZinePublicationDependencies,
  zine: PublicationRecord,
): Promise<boolean> {
  return needsGeneratedCover({
    pdfUrl: zine.pdfUrl,
    coverImage: zine.coverImage,
    zineId: zine.id,
    hasCompleteGeneratedCover: zine.pdfUrl
      ? await hasCompleteGeneratedCover(deps, zine, zine.pdfUrl)
      : false,
  });
}

async function shouldProcessExistingPublication(
  deps: ZinePublicationDependencies,
  zine: PublicationRecord,
  pdfUrl: string | null,
): Promise<boolean> {
  return needsGeneratedCover({
    pdfUrl,
    coverImage: zine.coverImage,
    zineId: zine.id,
    hasCompleteGeneratedCover: pdfUrl
      ? await hasCompleteGeneratedCover(deps, zine, pdfUrl)
      : false,
  });
}

async function hasCompleteGeneratedCover(
  deps: ZinePublicationDependencies,
  zine: PublicationRecord,
  pdfUrl: string,
): Promise<boolean> {
  return isCompleteGeneratedCover(toCoverGenerationRecord(zine), zine.id, pdfUrl)
    && await deps.covers.isAvailable(zine.id, zine.coverImage ?? '');
}

function toCoverGenerationRecord(zine: PublicationRecord) {
  return {
    cover_image: zine.coverImage,
    import_status: zine.importStatus,
    processed_pdf_url: zine.processedPdfUrl,
  };
}

function mergeTags(existingTags: unknown, newTags: unknown): unknown {
  const existing = parseTags(existingTags);
  const next = parseTags(newTags);
  return {
    ...existing,
    ...next,
    categories: Array.from(new Set([
      ...(existing.categories || []),
      ...(next.categories || []),
    ])),
  };
}
