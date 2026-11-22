import { isVotingOpen } from '@/domain/stage.service';
import type { VoteValue } from '@/domain/proposal.types';
import { resolveVote, type VoteIntent } from '@/domain/voting.service';
import { currentStage, requireProposal } from './participation-state.helpers';
import type { ParticipationDependencies } from './participation.types';

export type CastVoteResult = { status: 'closed' } | { status: 'recorded'; value: VoteValue | null };

export function createProposalVoteService({ repository, clock }: Pick<ParticipationDependencies, 'repository' | 'clock'>) {
  return {
    async castVote(input: { proposalNumber: number; voterHash: string; intent: VoteIntent }): Promise<CastVoteResult> {
      return repository.update((state) => {
        const proposal = requireProposal(state, input.proposalNumber);
        if (!isVotingOpen(currentStage(proposal))) return { status: 'closed' } as const;

        const index = state.votes.findIndex(
          (vote) => vote.proposalNumber === input.proposalNumber && vote.voterHash === input.voterHash,
        );
        const next = resolveVote(index === -1 ? null : state.votes[index].value, input.intent);
        if (next === null) {
          if (index !== -1) state.votes.splice(index, 1);
        } else if (index === -1) {
          state.votes.push({ proposalNumber: input.proposalNumber, voterHash: input.voterHash, value: next, updatedAt: clock().toISOString() });
        } else {
          state.votes[index] = { ...state.votes[index], value: next, updatedAt: clock().toISOString() };
        }
        return { status: 'recorded', value: next } as const;
      });
    },
  };
}
