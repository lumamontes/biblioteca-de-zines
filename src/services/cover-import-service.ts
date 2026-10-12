import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createCoverGeneration } from './cover-generation-module';
import { createR2AssetStorage } from './r2-storage-service';
import { createSupabaseZineCoverRepository } from './supabase-zine-cover-repository';
import { downloadSource } from './source-download-service';

type ZineDatabaseClient = SupabaseClient<Database>;

export async function createCoverGenerationFromUrl(
  zineId: number,
  sourceUrl: string,
  databaseClient?: ZineDatabaseClient,
): Promise<void> {
  const supabase = databaseClient ?? await createClient();
  await createCoverGeneration(
    () => downloadSource(sourceUrl),
    { id: zineId, kind: 'zine' },
    createSupabaseZineCoverRepository(supabase),
    createR2AssetStorage(),
    sourceUrl,
  );
}
