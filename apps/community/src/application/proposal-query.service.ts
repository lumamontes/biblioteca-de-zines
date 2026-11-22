import { splitDecision } from '@/domain/github-markup.helpers';
import { proposalPath } from '@/domain/proposal-path.helpers';
import { isContributionOpen, isVotingOpen } from '@/domain/stage.service';
import type { Stage } from '@/domain/proposal.types';
import { findProposal, toContributionView, toSummary } from './community-state.helpers';
import { STALE_AFTER_MS, RECENTLY_DECIDED_LIMIT } from './proposal-query.config';
import type { ProposalDetailView, ProposalListView, ProposalSummary } from './community-view.types';
import type { CommunityDependencies } from './community.types';

const OPEN_STAGES: ReadonlySet<Stage> = new Set<Stage>(['discussion', 'decided', 'in_progress']);
const DECIDED_STAGES: ReadonlySet<Stage> = new Set<Stage>(['available', 'not_planned']);

function byRecentActivity(a: ProposalSummary, b: ProposalSummary): number {
  return b.lastActivityAt.localeCompare(a.lastActivityAt);
}

export function createProposalQueryService({ repository, clock }: Pick<CommunityDependencies, 'repository' | 'clock'>) {
  return {
    async listProposals(voterHash: string | null = null): Promise<ProposalListView> {
      const state = await repository.read();
      const summaries = state.proposals
        .filter((proposal) => proposal.origin === 'community' || proposal.presentedByTeam)
        .map((proposal) => toSummary(state, proposal, voterHash));
      // Team questions come first, so an important topic with few votes is never buried under popular ones.
      const open = summaries
        .filter((item) => OPEN_STAGES.has(item.stage))
        .sort((a, b) => Number(b.featured) - Number(a.featured) || byRecentActivity(a, b));
      const suggestions = summaries.filter((item) => item.stage === 'triage').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const decided = summaries.filter((item) => DECIDED_STAGES.has(item.stage)).sort(byRecentActivity).slice(0, RECENTLY_DECIDED_LIMIT);
      return { notes: [...open, ...suggestions, ...decided] };
    },

    async getProposal(number: number, voterHash: string | null): Promise<ProposalDetailView | null> {
      const state = await repository.read();
      const proposal = findProposal(state, number);
      if (!proposal) return null;
      const summary = toSummary(state, proposal, voterHash);
      const responses = [...(proposal.cache?.officialResponses ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const latestDecision = [...responses].reverse().find((response) => response.kind === 'decision');
      const syncedAt = proposal.cache?.syncedAt ?? null;
      const viewerVote = voterHash
        ? state.votes.find((vote) => vote.proposalNumber === number && vote.voterHash === voterHash)?.value ?? null
        : null;

      return {
        ...summary,
        canonicalPath: proposalPath(proposal.number, proposal.publicTitle),
        openDecision: proposal.openDecision,
        originalReport: proposal.originalReport,
        principalIssue: proposal.principalIssue,
        relatedTasks: proposal.relatedTasks,
        pullRequests: proposal.cache?.pullRequests ?? [],
        decision: latestDecision ? { response: latestDecision, ...splitDecision(latestDecision.body) } : null,
        responses: responses.filter((response) => response !== latestDecision),
        contributions: state.contributions
          .filter((contribution) => contribution.proposalNumber === number)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((contribution) => toContributionView(contribution, state.influences)),
        viewerVote,
        votingOpen: isVotingOpen(summary.stage),
        contributionOpen: isContributionOpen(summary.stage),
        awaitingRelease: proposal.cache?.awaitingRelease ?? false,
        release: proposal.cache?.release ?? null,
        syncedAt,
        stale: proposal.principalIssue !== null && syncedAt !== null && clock().getTime() - Date.parse(syncedAt) > STALE_AFTER_MS,
        archiveReason: proposal.archive?.reason ?? null,
        questionRevisions: proposal.questionRevisions,
        presentedByTeam: proposal.origin === 'community' || proposal.presentedByTeam,
      };
    },
  };
}
