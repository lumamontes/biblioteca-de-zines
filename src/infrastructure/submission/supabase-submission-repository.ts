import type { SupabaseClient } from '@supabase/supabase-js';
import { flattenAuthors } from '@/utils/authors';
import type { Database, TablesInsert } from '@/types/database.types';
import type {
  SubmissionInput,
  SubmissionReceipt,
  SubmissionRepository,
} from '@/application/submission/submission-types';

export function createSupabaseSubmissionRepository(
  supabase: SupabaseClient<Database>,
): SubmissionRepository {
  return {
    async create(input: SubmissionInput, submissionBatchId: string): Promise<SubmissionReceipt> {
      const structuredAuthors = input.authors.map((author) => ({
        name: author.name.trim(),
        socialLinks: author.socialLinks.map((link) => link.trim()).filter(Boolean),
      }));
      const { author_name, author_url } = flattenAuthors(structuredAuthors);
      const zines: TablesInsert<'form_uploads'>[] = input.zines.map((zine) => ({
        title: zine.title.trim(),
        collection_title: zine.collectionTitle?.trim() || null,
        author_name,
        author_url,
        author_email: input.contactEmail,
        pdf_url: zine.pdfUrl.trim(),
        description: zine.description?.trim() || null,
        cover_image: zine.coverImageUrl?.trim() || null,
        published_year: zine.year.trim(),
        tags: {
          submission_batch_id: submissionBatchId,
          categories: zine.categories || [],
        },
        is_published: false,
      }));

      const { error } = await supabase.from('form_uploads').insert(zines);
      if (error) {
        throw new Error(`Erro ao enviar ${input.zines.length} zine${input.zines.length !== 1 ? 's' : ''}`);
      }

      return {
        submissionBatchId,
        authorNames: structuredAuthors.map((author) => author.name),
        zineCount: input.zines.length,
        zineTitles: input.zines.map((zine) => zine.title.trim()),
      };
    },
  };
}
