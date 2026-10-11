/** Composes source acquisition, page generation, catalog persistence, and storage adapters. */

import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';
import { extractFileIdFromUrl, downloadFile } from './google-drive-service';
import { createPageGeneration } from './page-generation-module';
import { createR2AssetStorage } from './r2-storage-service';
import { createSupabaseZinePageRepository } from './supabase-zine-page-repository';

type ZineDatabaseClient = SupabaseClient<Database>;

export async function createPageGenerationFromUrl(
  zineId: number,
  sourceUrl: string,
  databaseClient?: ZineDatabaseClient,
): Promise<void> {
  const supabase = databaseClient ?? await createClient();
  await createPageGeneration(
    () => downloadSource(sourceUrl),
    zineId,
    createSupabaseZinePageRepository(supabase),
    createR2AssetStorage(),
  );
}

async function downloadSource(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  if (url.includes('drive.google.com')) {
    return downloadFile(extractFileIdFromUrl(url));
  }

  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download source file: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || detectFileTypeFromBuffer(buffer).mimeType;
  return { buffer, mimeType };
}
