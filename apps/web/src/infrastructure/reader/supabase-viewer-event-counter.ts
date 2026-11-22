import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';
import type { ViewerEventType } from '@/application/reader/viewer-events';
import type { Database } from '@/types/database.types';

export async function incrementViewerEvent(
  supabase: SupabaseClient<Database>,
  slug: string,
  surface: ReaderDeliveryMode,
  event: Exclude<ViewerEventType, 'page-load'>,
) {
  const { error } = await supabase.rpc('count_reader_event', { p_slug: slug, p_surface: surface, p_event: event });
  if (error) throw error;
}
