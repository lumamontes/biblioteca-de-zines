import type { Vote, VoteValue } from './proposal.types';

export type VoteIntent = 'support' | 'oppose';

export type VoteTally = { support: number; oppose: number };

/** Choosing the active vote again withdraws it; choosing the other value replaces it. */
export function resolveVote(current: VoteValue | null, intent: VoteIntent): VoteValue | null {
  const requested: VoteValue = intent === 'support' ? 1 : -1;
  return current === requested ? null : requested;
}

export function tallyVotes(votes: readonly Pick<Vote, 'value'>[]): VoteTally {
  return votes.reduce<VoteTally>(
    (tally, vote) => (vote.value === 1 ? { ...tally, support: tally.support + 1 } : { ...tally, oppose: tally.oppose + 1 }),
    { support: 0, oppose: 0 },
  );
}
