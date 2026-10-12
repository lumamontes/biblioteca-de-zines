import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createCoverGeneration } from '@/application/cover-generation-service';
import { extractFirstPageFromPdf } from '@/services/pdf-service';
import { createR2AssetStorage } from '@/services/r2-storage-service';
import { optimizeCoverImage } from './cover-image-optimizer';
import { createSupabaseZineCoverRepository } from './supabase-zine-cover-repository';
import { downloadSource } from '@/services/source-download-service';

type ZineDatabaseClient = SupabaseClient<Database>;

export async function createCoverGenerationFromUrl(
  zineId: number,
  sourceUrl: string,
  databaseClient?: ZineDatabaseClient,
  options: { replaceExternalCover?: boolean } = {},
): Promise<void> {
  const supabase = databaseClient ?? await createClient();
  await createCoverGeneration(
    () => downloadSource(sourceUrl),
    { id: zineId, kind: 'zine' },
    createSupabaseZineCoverRepository(supabase),
    createR2AssetStorage(),
    sourceUrl,
    (source) => extractFirstPageFromPdf(source.buffer),
    optimizeCoverImage,
    options,
  );
}
