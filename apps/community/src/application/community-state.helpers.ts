import { proposalPath } from '@/domain/proposal-path.helpers';
import { stageForUnlinked } from '@/domain/stage.service';
import type { Contribution, Influence, Proposal, Stage } from '@/domain/proposal.types';
import { tallyVotes } from '@/domain/voting.service';
import type { ContributionView, ProposalSummary } from './community-view.types';
import type { CommunityState } from './community.types';

export function currentStage(proposal: Proposal): Stage {
  if (proposal.triageState !== 'linked') return stageForUnlinked(proposal.triageState);
  return proposal.cache?.stage ?? 'discussion';
}

export function findProposal(state: CommunityState, number: number): Proposal | undefined {
  return state.proposals.find((proposal) => proposal.number === number);
}

export function requireProposal(state: CommunityState, number: number): Proposal {
  const proposal = findProposal(state, number);
  if (!proposal) throw new Error(`Proposta ${number} não encontrada.`);
  return proposal;
}

export function absoluteProposalUrl(origin: string, proposal: Pick<Proposal, 'number' | 'publicTitle'>): string {
  return new URL(proposalPath(proposal.number, proposal.publicTitle), origin).toString();
}

export function toSummary(state: CommunityState, proposal: Proposal): ProposalSummary {
  const votes = tallyVotes(state.votes.filter((vote) => vote.proposalNumber === proposal.number));
  const contributionCount = state.contributions.filter(
    (contribution) => contribution.proposalNumber === proposal.number && contribution.moderation.state === 'visible',
  ).length;
  return {
    number: proposal.number,
    path: proposalPath(proposal.number, proposal.publicTitle),
    title: proposal.publicTitle,
    question: proposal.publicQuestion,
    stage: currentStage(proposal),
    origin: proposal.origin,
    featured: proposal.featured,
    votes,
    contributionCount,
    hasOfficialResponse: (proposal.cache?.officialResponses.length ?? 0) > 0,
    createdAt: proposal.createdAt,
    lastActivityAt: proposal.lastActivityAt,
  };
}

export function toContributionView(contribution: Contribution, influences: readonly Influence[]): ContributionView {
  const hidden = contribution.moderation.state !== 'visible';
  const influence = influences.find((item) => item.contributionId === contribution.id);
  return {
    id: contribution.id,
    displayName: contribution.displayName,
    text: hidden ? null : contribution.text,
    createdAt: contribution.createdAt,
    delivery: contribution.delivery.state,
    githubUrl: hidden ? null : contribution.delivery.githubUrl,
    githubCommentId: hidden ? null : contribution.delivery.githubCommentId,
    lastError: contribution.delivery.lastError,
    hidden,
    influence: influence ? { kind: influence.kind, note: influence.note, decisionUrl: influence.decisionUrl } : null,
  };
}

export function emptyState(): CommunityState {
  return { version: 1, nextProposalNumber: 1, proposals: [], contributions: [], votes: [], influences: [], pendingLinks: [] };
}
