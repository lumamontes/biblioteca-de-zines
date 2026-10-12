import type {
  SubmissionInput,
  SubmissionNotifier,
  SubmissionReceipt,
  SubmissionRepository,
} from '@/application/submission/submission-types';

export function createSubmissionService(deps: {
  submissions: SubmissionRepository;
  notifications: SubmissionNotifier;
}) {
  return {
    async submit(input: SubmissionInput): Promise<SubmissionReceipt> {
      const submissionBatchId = Date.now().toString();
      const receipt = await deps.submissions.create(input, submissionBatchId);
      await deps.notifications.notify({ ...receipt, contactEmail: input.contactEmail });
      return receipt;
    },
  };
}
