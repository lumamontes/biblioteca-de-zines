import { validateSuggestion } from '@/domain/input-validation.helpers';
import { proposalPath } from '@/domain/proposal-path.helpers';
import type { Proposal } from '@/domain/proposal.types';
import type { ParticipationDependencies } from './participation.types';

export type SuggestResult =
  | { status: 'invalid'; errors: Partial<Record<'title' | 'report' | 'displayName', string>> }
  | { status: 'created'; number: number; path: string };

export function createSuggestionService({ repository, clock }: Pick<ParticipationDependencies, 'repository' | 'clock'>) {
  return {
    async suggest(input: { title: unknown; report: unknown; displayName: unknown }): Promise<SuggestResult> {
      const { values, errors } = validateSuggestion(input);
      if (Object.keys(errors).length > 0) return { status: 'invalid', errors };
      const now = clock().toISOString();

      const proposal = await repository.update((state) => {
        const created: Proposal = {
          number: state.nextProposalNumber,
          origin: 'community',
          publicTitle: values.title,
          publicQuestion: values.report,
          openDecision: null,
          originalReport: { text: values.report, displayName: values.displayName, submittedAt: now },
          createdAt: now,
          lastActivityAt: now,
          featured: false,
          triageState: 'triage',
          archive: null,
          principalIssue: null,
          relatedTasks: [],
          questionRevisions: [],
          presentedByTeam: false,
          cache: null,
        };
        state.nextProposalNumber += 1;
        state.proposals.push(created);
        return created;
      });

      return { status: 'created', number: proposal.number, path: proposalPath(proposal.number, proposal.publicTitle) };
    },
  };
}
