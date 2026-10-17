import { createClient } from '@supabase/supabase-js';
import { inspectPdfSource } from '@/infrastructure/rendering/pdf-source-inspector';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';
import { createSupabaseSourceMetadataRepository } from '@/infrastructure/source-metadata/supabase-source-metadata-repository';
import { createSupabaseSourceMetadataSourceReader } from '@/infrastructure/source-metadata/supabase-source-metadata-source-reader';
import { observeSourceMetadataSource } from '@/application/source-metadata/observe-source-metadata-source';
import type { Database } from '@/types/database.types';
import type { SourceMetadataBatchSource } from '@/application/source-metadata/source-metadata-batch-types';

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
    observe: (source: SourceMetadataBatchSource) => observeSourceMetadataSource(source, { repository, download: downloadSource, inspect: inspectPdfSource }),
  };
}
