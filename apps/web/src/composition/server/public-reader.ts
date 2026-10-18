import { getViewerReader as getViewerReaderData } from '@/application/reader/viewer-reader-service';
import type { ViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { createSupabasePublicReaderRepository } from '@/infrastructure/reader/supabase-public-reader-repository';
import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';
import { createClient } from '@/utils/supabase/server';

export async function getViewerReader(slug: string, rollout: ViewerRolloutConfig, surface: ReaderDeliveryMode, betaToken?: string) {
  return getViewerReaderData(createSupabasePublicReaderRepository(await createClient()), slug, rollout, surface, betaToken);
}
