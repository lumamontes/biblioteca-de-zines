import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createCoverGeneration } from '@/application/cover-generation-service';
import { extractFirstPageFromPdf } from '@/infrastructure/rendering/pdf-service';
import { createR2AssetStorage } from '@/infrastructure/storage/r2-storage-service';
import { optimizeCoverImage } from './cover-image-optimizer';
import { createSupabaseZineCoverRepository } from './supabase-zine-cover-repository';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';

type ZineDatabaseClient = SupabaseClient<Database>;

export async function createCoverGenerationFromUrl(
  zineId: number,
  sourceUrl: string,
  databaseClient?: ZineDatabaseClient,
  options: { expectedCoverImage?: string | null; replaceExternalCover?: boolean } = {},
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
