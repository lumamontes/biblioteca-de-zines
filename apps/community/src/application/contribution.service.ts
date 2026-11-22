import { contributionCommentBody, contributionMarker, moderatedCommentBody } from '@/domain/github-markup.helpers';
import { isContributionId, validateContribution } from '@/domain/input-validation.helpers';
import { isContributionOpen } from '@/domain/stage.service';
import type { Contribution } from '@/domain/proposal.types';
import { DELIVERY_MESSAGES } from './contribution.config';
import { formatModerationDate, isDeliverable } from './contribution.helpers';
import { absoluteProposalUrl, currentStage, requireProposal } from './community-state.helpers';
import type { SubmitContributionResult } from './community-view.types';
import type { CommunityDependencies } from './community.types';

export function createContributionService(deps: CommunityDependencies) {
  const { repository, github, config, clock } = deps;

  /**
   * Publishes one contribution to the principal issue at most once. The marker in
   * the comment body makes a retry after a lost confirmation find the earlier
   * comment instead of posting a duplicate.
   */
  async function deliver(contributionId: string): Promise<Contribution> {
    const claimed = await repository.update((state) => {
      const contribution = state.contributions.find((item) => item.id === contributionId);
      if (!contribution) throw new Error('Contribuição não encontrada.');
      const { delivery } = contribution;
      if (!isDeliverable(contribution, clock().getTime())) return null;
      const proposal = requireProposal(state, contribution.proposalNumber);
      contribution.delivery = { ...delivery, state: 'sending', attempts: delivery.attempts + 1, lastAttemptAt: clock().toISOString(), lastError: null };
      return { contribution: structuredClone(contribution), proposalUrl: absoluteProposalUrl(config.publicOrigin, proposal) };
    });
    if (!claimed) return (await repository.read()).contributions.find((item) => item.id === contributionId)!;

    const { contribution, proposalUrl } = claimed;
    const issueNumber = contribution.delivery.issueNumber!;
    try {
      const marker = contributionMarker(contribution.id);
      const comment =
        (await github.findCommentByMarker(issueNumber, marker)) ??
        (await github.createComment(
          issueNumber,
          contributionCommentBody({ contributionId: contribution.id, displayName: contribution.displayName, text: contribution.text, proposalUrl }),
        ));
      const sent = await repository.update((state) => {
        const stored = state.contributions.find((item) => item.id === contribution.id)!;
        stored.delivery = { ...stored.delivery, state: 'sent', githubCommentId: comment.id, githubUrl: comment.url, lastError: null };
        return structuredClone(stored);
      });
      if (sent.moderation.state === 'hidden') {
        await github.updateComment(comment.id, moderatedCommentBody(sent.id, formatModerationDate(sent.moderation.moderatedAt ?? clock().toISOString())));
      }
      return sent;
    } catch (error) {
      return repository.update((state) => {
        const stored = state.contributions.find((item) => item.id === contribution.id)!;
        stored.delivery = { ...stored.delivery, state: 'failed', lastError: error instanceof Error ? error.message : String(error) };
        return structuredClone(stored);
      });
    }
  }

  function resultFor(contribution: Contribution): SubmitContributionResult {
    return {
      status: 'saved',
      contributionId: contribution.id,
      delivery: contribution.delivery.state,
      githubUrl: contribution.delivery.githubUrl,
      message: DELIVERY_MESSAGES[contribution.delivery.state],
    };
  }

  return {
    deliver,

    async submit(input: { proposalNumber: number; contributionId: unknown; displayName: unknown; text: unknown }): Promise<SubmitContributionResult> {
      if (!isContributionId(input.contributionId)) throw new Error('Chave de contribuição inválida.');
      const contributionId = input.contributionId;
      const { values, errors } = validateContribution(input);
      if (Object.keys(errors).length > 0) return { status: 'invalid', errors };
      const now = clock().toISOString();

      const outcome = await repository.update((state) => {
        const existing = state.contributions.find((item) => item.id === contributionId);
        if (existing) {
          if (existing.proposalNumber !== input.proposalNumber) throw new Error('Chave de contribuição usada em outra proposta.');
          return { kind: 'existing' as const, contribution: structuredClone(existing) };
        }
        const proposal = requireProposal(state, input.proposalNumber);
        if (!isContributionOpen(currentStage(proposal))) return { kind: 'closed' as const };
        const linkedIssue = proposal.principalIssue?.number ?? null;
        const contribution: Contribution = {
          id: contributionId,
          proposalNumber: proposal.number,
          displayName: values.displayName,
          text: values.text,
          createdAt: now,
          delivery: { state: linkedIssue ? 'pending' : 'local', attempts: 0, lastAttemptAt: null, lastError: null, githubCommentId: null, githubUrl: null, issueNumber: linkedIssue },
          moderation: { state: 'visible', reason: null, moderatedAt: null, moderatedBy: null },
        };
        state.contributions.push(contribution);
        proposal.lastActivityAt = now;
        return { kind: 'created' as const, contribution: structuredClone(contribution) };
      });

      if (outcome.kind === 'closed') return { status: 'closed' };
      const { contribution } = outcome;
      const needsDelivery = contribution.delivery.state === 'pending' || contribution.delivery.state === 'failed';
      return resultFor(needsDelivery ? await deliver(contribution.id) : contribution);
    },

    /** Retries every pending or failed delivery. Safe to run repeatedly. */
    async processOutbox(): Promise<{ attempted: number; sent: number; failed: number }> {
      const state = await repository.read();
      const nowMs = clock().getTime();
      const candidates = state.contributions.filter((item) => isDeliverable(item, nowMs));
      let sent = 0;
      let failed = 0;
      for (const candidate of candidates) {
        const result = await deliver(candidate.id);
        if (result.delivery.state === 'sent') sent += 1;
        if (result.delivery.state === 'failed') failed += 1;
      }
      return { attempted: candidates.length, sent, failed };
    },
  };
}
