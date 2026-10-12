import type { SupabaseClient } from '@supabase/supabase-js';
import { flattenAuthors, parseUploadAuthors } from '@/utils/authors';
import type { Database, Json, Tables } from '@/types/database.types';
import type {
  PublicationRecord,
  PublicationRepository,
  PublicationUpload,
  PublicationUpdate,
} from '@/application/publication/zine-publication-types';

type ZineDatabaseClient = SupabaseClient<Database>;
type UploadRow = Tables<'form_uploads'>;
type PublicationRow = Tables<'library_zines'>;

export function createSupabaseZinePublicationRepository(
  supabase: ZineDatabaseClient,
): PublicationRepository {
  return {
    async findUpload(uploadId) {
      const { data, error } = await supabase
        .from('form_uploads')
        .select('*')
        .eq('id', uploadId)
        .single();
      if (error && error.code !== 'PGRST116') throw new Error(`Erro ao buscar zine: ${error.message}`);
      return data ? toPublicationUpload(data) : null;
    },

    async findBySlug(slug) {
      const { data, error } = await supabase
        .from('library_zines')
        .select('id, tags, source_upload_id, cover_image, active_page_generation, pdf_url, import_status, processed_pdf_url, total_pages')
        .eq('slug', slug)
        .single();
      if (error && error.code !== 'PGRST116') throw new Error(`Erro ao buscar zine: ${error.message}`);
      return data ? toPublicationRecord(data) : null;
    },

    async findById(zineId) {
      const { data, error } = await supabase
        .from('library_zines')
        .select('id, tags, source_upload_id, cover_image, active_page_generation, pdf_url, import_status, processed_pdf_url, total_pages')
        .eq('id', zineId)
        .single();
      if (error && error.code !== 'PGRST116') throw new Error(`Erro ao buscar zine: ${error.message}`);
      return data ? toPublicationRecord(data) : null;
    },

    async updateUpload(uploadId, input) {
      const { error } = await supabase.from('form_uploads').update({
        title: input.title,
        description: input.description,
        collection_title: input.collectionTitle,
        ...flattenAuthors(input.authors),
        pdf_url: input.pdfUrl,
        cover_image: input.coverImage,
        published_year: input.publishedYear,
        tags: input.tags as Json,
      }).eq('id', uploadId);
      if (error) throw new Error(`Erro ao atualizar upload: ${error.message}`);
    },

    async markUploadPublished(uploadId) {
      const { error } = await supabase.from('form_uploads').update({ is_published: true }).eq('id', uploadId);
      if (error) throw new Error(`Erro ao marcar upload como publicado: ${error.message}`);
    },

    async insert(input) {
      const insert = {
        title: input.title,
        description: input.description,
        collection_title: input.collectionTitle,
        cover_image: input.coverImage,
        pdf_url: input.pdfUrl,
        tags: input.tags as Json,
        is_published: true,
        import_status: input.importStatus,
        source_upload_id: input.sourceUploadId,
        year: input.publishedYear,
        slug: input.slug,
      } as unknown as Database['public']['Tables']['library_zines']['Insert'];
      const { data, error } = await supabase.from('library_zines').insert(insert).select('id').single();
      if (error || !data) throw new Error(`Erro ao publicar a zine: ${error?.message}`);
      return data.id;
    },

    async update(zineId, input) {
      const { error } = await supabase.from('library_zines')
        .update(toPublicationUpdate(input))
        .eq('id', zineId);
      if (error) throw new Error(`Erro ao atualizar zine: ${error.message}`);
    },

    async setPublished(zineId, isPublished) {
      const { error } = await supabase
        .from('library_zines')
        .update({ is_published: isPublished })
        .eq('id', zineId);
      if (error) throw new Error(`${isPublished ? 'Erro ao republicar' : 'Erro ao despublicar'} a zine: ${error.message}`);
    },
  };
}

function toPublicationUpload(row: UploadRow): PublicationUpload {
  return {
    title: row.title,
    description: row.description,
    collectionTitle: row.collection_title,
    coverImage: row.cover_image,
    pdfUrl: row.pdf_url,
    tags: row.tags,
    publishedYear: row.published_year,
    authors: parseUploadAuthors(row),
  };
}

function toPublicationRecord(
  row: Pick<PublicationRow, 'id' | 'tags' | 'source_upload_id' | 'cover_image' | 'active_page_generation' | 'pdf_url' | 'import_status' | 'processed_pdf_url' | 'total_pages'>,
): PublicationRecord {
  return {
    id: row.id,
    tags: row.tags,
    sourceUploadId: row.source_upload_id,
    coverImage: row.cover_image,
    activePageGeneration: row.active_page_generation,
    pdfUrl: row.pdf_url,
    importStatus: row.import_status,
    processedPdfUrl: row.processed_pdf_url,
    totalPages: row.total_pages,
  };
}

function toPublicationUpdate(input: PublicationUpdate) {
  return {
    ...(input.activePageGeneration !== undefined ? { active_page_generation: input.activePageGeneration } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.collectionTitle !== undefined ? { collection_title: input.collectionTitle } : {}),
    ...(input.coverImage !== undefined ? { cover_image: input.coverImage } : {}),
    ...(input.pdfUrl !== undefined ? { pdf_url: input.pdfUrl } : {}),
    ...(input.tags !== undefined ? { tags: input.tags as Json } : {}),
    ...(input.publishedYear !== undefined ? { year: input.publishedYear } : {}),
    ...(input.importStatus !== undefined ? { import_status: input.importStatus } : {}),
    ...(input.processedPdfUrl !== undefined ? { processed_pdf_url: input.processedPdfUrl } : {}),
    ...(input.totalPages !== undefined ? { total_pages: input.totalPages } : {}),
  };
}
