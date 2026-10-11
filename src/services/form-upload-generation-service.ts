import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPageGeneration } from './page-generation-module';
import { createR2AssetStorage } from './r2-storage-service';
import { createSupabaseFormUploadPageRepository } from './supabase-form-upload-page-repository';
import { downloadSource } from './source-download-service';

export async function createFormUploadPageGenerationFromUrl(
  formUploadId: number,
  sourceUrl: string,
  databaseClient?: SupabaseClient<Database>,
): Promise<void> {
  const supabase = databaseClient ?? await createClient();
  await createPageGeneration(
    () => downloadSource(sourceUrl),
    { id: formUploadId, kind: 'form-upload' },
    createSupabaseFormUploadPageRepository(supabase),
    createR2AssetStorage(),
    sourceUrl,
  );
}
