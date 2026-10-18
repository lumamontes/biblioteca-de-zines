import { getViewerReader as getViewerReaderData } from '@/application/reader/viewer-reader-service';
import type { ViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { createSupabasePublicReaderRepository } from '@/infrastructure/reader/supabase-public-reader-repository';
import { createClient } from '@/utils/supabase/server';

export async function getViewerReader(slug: string, rollout: ViewerRolloutConfig) {
  return getViewerReaderData(createSupabasePublicReaderRepository(await createClient()), slug, rollout);
}
