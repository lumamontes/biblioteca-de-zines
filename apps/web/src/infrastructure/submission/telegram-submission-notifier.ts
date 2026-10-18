import { sendTelegramNotification } from '@/utils/telegram';
import type { SubmissionNotifier } from '@/application/submission/submission-types';

export const telegramSubmissionNotifier: SubmissionNotifier = {
  async notify(receipt) {
    await sendTelegramNotification({
      authorNames: receipt.authorNames,
      zineCount: receipt.zineCount,
      zineTitles: receipt.zineTitles,
      contactEmail: receipt.contactEmail || undefined,
      submissionId: receipt.submissionBatchId,
    });
  },
};
