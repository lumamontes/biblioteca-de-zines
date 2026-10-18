import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  SourceMetadataBatchSource,
} from '@/application/source-metadata/source-metadata-batch-types';

export function createSupabaseSourceMetadataSourceReader(
  supabase: SupabaseClient<Database>,
): () => Promise<SourceMetadataBatchSource[]> {
  return async () => {
    const [{ data: zines, error: zinesError }, { data: uploads, error: uploadsError }] = await Promise.all([
      supabase.from('library_zines').select('id, pdf_url, title').not('pdf_url', 'is', null).order('id'),
      supabase.from('form_uploads').select('id, pdf_url, title, author_name').not('pdf_url', 'is', null).order('id'),
    ]);
    if (zinesError) throw new Error(`Failed to list publication sources: ${zinesError.message}`);
    if (uploadsError) throw new Error(`Failed to list submission sources: ${uploadsError.message}`);

    return [
      ...(zines ?? []).map((source) => ({
        sourceId: `publication:${source.id}`,
        publicationId: source.id,
        submissionId: null,
        sourceUri: source.pdf_url as string,
        catalogue: { title: source.title, author: null },
      })),
      ...(uploads ?? []).map((source) => ({
        sourceId: `submission:${source.id}`,
        publicationId: null,
        submissionId: source.id,
        sourceUri: source.pdf_url as string,
        catalogue: { title: source.title, author: source.author_name },
      })),
    ];
  };
}
