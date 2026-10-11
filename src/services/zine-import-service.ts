/** Composes source acquisition, page generation, catalog persistence, and storage adapters. */

import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPageGeneration } from './page-generation-module';
import { createR2AssetStorage } from './r2-storage-service';
import { createSupabaseZinePageRepository } from './supabase-zine-page-repository';
import { downloadSource } from './source-download-service';

type ZineDatabaseClient = SupabaseClient<Database>;

export async function createPageGenerationFromUrl(
  zineId: number,
  sourceUrl: string,
  databaseClient?: ZineDatabaseClient,
): Promise<void> {
  const supabase = databaseClient ?? await createClient();
  await createPageGeneration(
    () => downloadSource(sourceUrl),
    { id: zineId, kind: 'zine' },
    createSupabaseZinePageRepository(supabase),
    createR2AssetStorage(),
    sourceUrl,
  );
}
