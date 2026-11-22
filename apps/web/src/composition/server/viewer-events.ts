import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';
import type { ViewerEventType } from '@/application/reader/viewer-events';
import { incrementViewerEvent } from '@/infrastructure/reader/supabase-viewer-event-counter';
import { createAdminClient } from '@/utils/supabase/admin';

export async function countViewerEvent(slug: string, surface: ReaderDeliveryMode, event: Exclude<ViewerEventType, 'page-load'>) {
  await incrementViewerEvent(createAdminClient(), slug, surface, event);
}
