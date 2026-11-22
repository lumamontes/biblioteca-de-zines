import { createContributionService } from '@/application/contribution.service';
import { createProposalQueryService } from '@/application/proposal-query.service';
import { createProposalVoteService } from '@/application/proposal-vote.service';
import { createSuggestionService } from '@/application/suggestion.service';
import { createSyncService } from '@/application/sync.service';
import { createTriageService } from '@/application/triage.service';
import type { CommunityDependencies } from '@/application/community.types';

/** Builds every use case from one set of adapters. Runtime-neutral, so tests use it too. */
export function createCommunity(deps: CommunityDependencies) {
  const sync = createSyncService(deps);
  return {
    queries: createProposalQueryService(deps),
    suggestions: createSuggestionService(deps),
    votes: createProposalVoteService(deps),
    contributions: createContributionService(deps),
    sync,
    triage: createTriageService({ ...deps, sync }),
  };
}

export type Community = ReturnType<typeof createCommunity>;
