import { createClient } from '@/utils/supabase/server';
import { createSubmissionModule as createApplicationSubmissionModule } from '@/application/submission/submission-module';
import { createSupabaseSubmissionRepository } from '@/infrastructure/submission/supabase-submission-repository';
import { telegramSubmissionNotifier } from '@/infrastructure/submission/telegram-submission-notifier';

export async function createSubmissionModule() {
  return createApplicationSubmissionModule({
    submissions: createSupabaseSubmissionRepository(await createClient()),
    notifications: telegramSubmissionNotifier,
  });
}
