import { createClient } from '@supabase/supabase-js';
import { extractSourceObservation } from '@/domain/source-observation';
import { inspectPdfSource } from '@/infrastructure/rendering/pdf-source-inspector';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';
import { createSupabaseSourceMetadataRepository } from '@/infrastructure/source-metadata/supabase-source-metadata-repository';
import { createSupabaseSourceMetadataSourceReader } from '@/infrastructure/source-metadata/supabase-source-metadata-source-reader';
import { createSourceMetadataObservation } from '@/application/source-metadata/source-metadata-observation-factory';
import type { Database } from '@/types/database.types';

export function createSourceMetadataBatchDependencies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  const repository = createSupabaseSourceMetadataRepository(supabase);

  return {
    listSources: createSupabaseSourceMetadataSourceReader(supabase),
    record: repository.create,
    async observe(source: Parameters<typeof createSourceMetadataObservation>[0]) {
      const acquiredAt = new Date().toISOString();
      const acquisition = {
        method: source.sourceUri.includes('drive.google.com') ? 'google-drive' : 'http',
        acquiredAt,
        filename: source.sourceUri.split('/').pop()?.split('?')[0] ?? null,
        declaredSize: null,
        httpStatus: null,
        redirectOutcome: null,
        declaredMediaType: null as string | null,
      };
      try {
        const downloaded = await downloadSource(source.sourceUri);
        acquisition.declaredMediaType = downloaded.mimeType;
        const outcome = await extractSourceObservation({
          source: downloaded,
          sourceUri: source.sourceUri,
          acquisition: { method: acquisition.method as 'http' | 'google-drive', status: 'acquired', filename: acquisition.filename ?? undefined },
        }, inspectPdfSource);
        return createSourceMetadataObservation(source, outcome, { ...acquisition, declaredSize: downloaded.buffer.byteLength });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Source acquisition failed';
        const status = message.match(/\b([1-5]\d{2})\b/);
        acquisition.httpStatus = status ? Number(status[1]) : null;
        const outcome = await extractSourceObservation({
          sourceUri: source.sourceUri,
          acquisition: { method: acquisition.method as 'http' | 'google-drive', status: 'unreachable', failureReason: message },
        }, inspectPdfSource);
        return createSourceMetadataObservation(source, outcome, acquisition);
      }
    },
  };
}
