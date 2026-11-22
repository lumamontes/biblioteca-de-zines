import type { DeliveryState } from '@/domain/proposal.types';

export type ContributionFormState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: Partial<Record<'text' | 'displayName', string>> }
  | { status: 'closed'; message: string }
  | { status: 'saved'; contributionId: string; delivery: DeliveryState; githubUrl: string | null; message: string }
  | { status: 'error'; message: string };

export type ContributionAction = (state: ContributionFormState, formData: FormData) => Promise<ContributionFormState>;

export type ContributionDraft = { contributionId: string; text: string };
