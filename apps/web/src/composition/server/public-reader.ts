import { getPublicReaderPublication } from '@/application/reader/public-reader-service';
import { getViewerReader as getViewerReaderData } from '@/application/reader/viewer-reader-service';
import type { ViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { createSupabasePublicReaderRepository } from '@/infrastructure/reader/supabase-public-reader-repository';
import { createClient } from '@/utils/supabase/server';

export async function getPublicReader(slug: string) {
  return getPublicReaderPublication(createSupabasePublicReaderRepository(await createClient()), slug);
}

export async function getViewerReader(slug: string, rollout: ViewerRolloutConfig, surface: 'reader' | 'embed', betaToken?: string) {
  return getViewerReaderData(createSupabasePublicReaderRepository(await createClient()), slug, rollout, surface, betaToken);
}
