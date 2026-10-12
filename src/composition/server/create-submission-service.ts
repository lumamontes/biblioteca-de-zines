import { createClient } from '@/utils/supabase/server';
import { createSubmissionService } from '@/application/submission/submission-service';
import { createSupabaseSubmissionRepository } from '@/infrastructure/submission/supabase-submission-repository';
import { telegramSubmissionNotifier } from '@/infrastructure/submission/telegram-submission-notifier';

export async function createSubmissionServiceForRequest() {
  return createSubmissionService({
    submissions: createSupabaseSubmissionRepository(await createClient()),
    notifications: telegramSubmissionNotifier,
  });
}
