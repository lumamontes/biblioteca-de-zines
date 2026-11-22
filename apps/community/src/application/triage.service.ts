import { linkCommentBody, moderatedCommentBody, proposalMarker } from '@/domain/github-markup.helpers';
import { INPUT_LIMITS } from '@/domain/input-validation.config';
import type { InfluenceKind } from '@/domain/proposal.types';
import { tallyVotes } from '@/domain/voting.service';
import { formatModerationDate } from './contribution.helpers';
import { absoluteProposalUrl, currentStage, requireProposal, toContributionView, toSummary } from './community-state.helpers';
import type { TriageProposalView, TriageView } from './community-view.types';
import type { CommunityDependencies, CommunityState } from './community.types';
import type { createSyncService } from './sync.service';

export type LinkTarget = { kind: 'existing'; issueNumber: number } | { kind: 'create' };

export type TriageResult = { status: 'done'; message: string } | { status: 'rejected'; message: string };

function triageView(state: CommunityState, number: number): TriageProposalView {
  const proposal = requireProposal(state, number);
  return {
    summary: toSummary(state, proposal),
    originalReport: proposal.originalReport,
    principalIssue: proposal.principalIssue,
    warnings: proposal.cache?.warnings ?? [],
    contributions: state.contributions
      .filter((contribution) => contribution.proposalNumber === number)
      .map((contribution) => toContributionView(contribution, state.influences)),
  };
}

export function createTriageService(deps: CommunityDependencies & { sync: ReturnType<typeof createSyncService> }) {
  const { repository, github, config, clock, sync } = deps;

  return {
    async overview(): Promise<TriageView> {
      const state = await repository.read();
      return {
        inTriage: state.proposals.filter((proposal) => proposal.triageState === 'triage').map((proposal) => triageView(state, proposal.number)),
        linked: state.proposals.filter((proposal) => proposal.triageState === 'linked').map((proposal) => triageView(state, proposal.number)),
        archived: state.proposals.filter((proposal) => proposal.triageState === 'archived').map((proposal) => triageView(state, proposal.number)),
        deliveryProblems: state.contributions
          .filter((contribution) => contribution.delivery.state === 'failed' || contribution.delivery.state === 'pending')
          .map((contribution) => ({
            ...toContributionView(contribution, state.influences),
            proposalNumber: contribution.proposalNumber,
            proposalTitle: requireProposal(state, contribution.proposalNumber).publicTitle,
          })),
      };
    },

    /**
     * Links a suggestion to its principal issue. Repeating the operation, even after a
     * failure halfway through, finds the issue and the link comment by their markers.
     */
    async link(input: { proposalNumber: number; target: LinkTarget; maintainer: string }): Promise<TriageResult> {
      const state = await repository.read();
      const proposal = requireProposal(state, input.proposalNumber);
      const marker = proposalMarker(proposal.number);
      const proposalUrl = absoluteProposalUrl(config.publicOrigin, proposal);

      if (proposal.principalIssue) {
        const sameTarget = input.target.kind === 'create' || input.target.issueNumber === proposal.principalIssue.number;
        return sameTarget
          ? { status: 'done', message: `A proposta já está ligada à issue #${proposal.principalIssue.number}.` }
          : { status: 'rejected', message: `A proposta já está ligada à issue #${proposal.principalIssue.number}. Desfaça o vínculo no banco antes de trocar.` };
      }
      if (proposal.triageState === 'archived') return { status: 'rejected', message: 'Desarquive a sugestão antes de vincular.' };

      let issue: { number: number; url: string; title: string };
      if (input.target.kind === 'existing') {
        const snapshot = await github.getIssue(input.target.issueNumber);
        if (!snapshot) return { status: 'rejected', message: `A issue #${input.target.issueNumber} não existe em ${github.repository}.` };
        issue = { number: snapshot.number, url: snapshot.url, title: snapshot.title };
      } else {
        await repository.update((current) => {
          if (!current.pendingLinks.some((link) => link.proposalNumber === proposal.number)) {
            current.pendingLinks.push({ proposalNumber: proposal.number, startedAt: clock().toISOString() });
          }
        });
        issue =
          (await github.findIssueByMarker(marker)) ??
          (await github.createIssue({
            title: proposal.publicTitle,
            body: `${marker}\nSugestão enviada pela comunidade no portal da comunidade: ${proposalUrl}\n\n> ${(proposal.originalReport?.text ?? proposal.publicQuestion).split('\n').join('\n> ')}`,
          }));
      }

      const tally = tallyVotes(state.votes.filter((vote) => vote.proposalNumber === proposal.number));
      const linkComment =
        (await github.findCommentByMarker(issue.number, marker)) ??
        (await github.createComment(
          issue.number,
          linkCommentBody({
            proposalNumber: proposal.number,
            proposalUrl,
            votesFor: tally.support,
            votesAgainst: tally.oppose,
            contributionCount: state.contributions.filter((item) => item.proposalNumber === proposal.number && item.moderation.state === 'visible').length,
          }),
        ));

      const now = clock().toISOString();
      await repository.update((current) => {
        const stored = requireProposal(current, proposal.number);
        stored.triageState = 'linked';
        stored.principalIssue = { number: issue.number, url: issue.url, technicalTitle: issue.title, linkedAt: now, linkCommentUrl: linkComment.url };
        stored.lastActivityAt = now;
        current.pendingLinks = current.pendingLinks.filter((link) => link.proposalNumber !== proposal.number);
      });
      await sync.syncProposal(proposal.number);
      return { status: 'done', message: `Sugestão ligada à issue #${issue.number}. A conversa e os votos continuam no mesmo endereço.` };
    },

    async addRelatedTask(input: { proposalNumber: number; issueNumber: number }): Promise<TriageResult> {
      const snapshot = await github.getIssue(input.issueNumber);
      if (!snapshot) return { status: 'rejected', message: `A issue #${input.issueNumber} não existe.` };
      return repository.update((state) => {
        const proposal = requireProposal(state, input.proposalNumber);
        if (proposal.principalIssue?.number === input.issueNumber) return { status: 'rejected', message: 'Essa já é a issue principal.' } as const;
        if (!proposal.relatedTasks.some((task) => task.number === input.issueNumber)) {
          proposal.relatedTasks.push({ number: snapshot.number, url: snapshot.url, title: snapshot.title });
        }
        return { status: 'done', message: `Tarefa #${input.issueNumber} associada.` } as const;
      });
    },

    async archive(input: { proposalNumber: number; reason: string; maintainer: string }): Promise<TriageResult> {
      const reason = input.reason.trim();
      if (!reason) return { status: 'rejected', message: 'Explique publicamente por que a sugestão será arquivada.' };
      if (reason.length > INPUT_LIMITS.archiveReason) return { status: 'rejected', message: `Use até ${INPUT_LIMITS.archiveReason} caracteres.` };
      return repository.update((state) => {
        const proposal = requireProposal(state, input.proposalNumber);
        if (proposal.triageState !== 'triage') return { status: 'rejected', message: 'Só sugestões em triagem podem ser arquivadas pelo portal.' } as const;
        const now = clock().toISOString();
        proposal.triageState = 'archived';
        proposal.archive = { reason, archivedAt: now, archivedBy: input.maintainer };
        proposal.lastActivityAt = now;
        return { status: 'done', message: 'Sugestão arquivada com justificativa pública.' } as const;
      });
    },

    async reopenArchived(input: { proposalNumber: number }): Promise<TriageResult> {
      return repository.update((state) => {
        const proposal = requireProposal(state, input.proposalNumber);
        if (proposal.triageState !== 'archived') return { status: 'rejected', message: 'A sugestão não está arquivada.' } as const;
        proposal.triageState = 'triage';
        proposal.archive = null;
        return { status: 'done', message: 'Sugestão reaberta para triagem.' } as const;
      });
    },

    /** Hides a contribution in the portal and replaces or cancels its GitHub copy. */
    async moderate(input: { contributionId: string; reason: string; maintainer: string }): Promise<TriageResult> {
      const now = clock().toISOString();
      const target = await repository.update((state) => {
        const contribution = state.contributions.find((item) => item.id === input.contributionId);
        if (!contribution) return null;
        contribution.moderation = { state: 'hidden', reason: input.reason.trim() || null, moderatedAt: now, moderatedBy: input.maintainer };
        if (contribution.delivery.state === 'pending' || contribution.delivery.state === 'failed') {
          contribution.delivery = { ...contribution.delivery, state: 'cancelled' };
        }
        return structuredClone(contribution);
      });
      if (!target) return { status: 'rejected', message: 'Contribuição não encontrada.' };
      if (target.delivery.state === 'sent' && target.delivery.githubCommentId !== null) {
        await github.updateComment(target.delivery.githubCommentId, moderatedCommentBody(target.id, formatModerationDate(now)));
        return { status: 'done', message: 'Contribuição ocultada no portal. O texto no GitHub foi substituído por um aviso de moderação.' };
      }
      return { status: 'done', message: 'Contribuição ocultada no portal. Ela não será publicada no GitHub.' };
    },

    async recordInfluence(input: { contributionId: string; kind: InfluenceKind; note: string; maintainer: string }): Promise<TriageResult> {
      return repository.update((state) => {
        const contribution = state.contributions.find((item) => item.id === input.contributionId);
        if (!contribution) return { status: 'rejected', message: 'Contribuição não encontrada.' } as const;
        const proposal = requireProposal(state, contribution.proposalNumber);
        const decision = [...(proposal.cache?.officialResponses ?? [])].reverse().find((response) => response.kind === 'decision');
        state.influences = state.influences.filter((item) => item.contributionId !== input.contributionId);
        state.influences.push({
          contributionId: input.contributionId,
          proposalNumber: proposal.number,
          kind: input.kind,
          note: input.note.trim() || null,
          decisionUrl: decision?.url ?? null,
          recordedAt: clock().toISOString(),
          recordedBy: input.maintainer,
        });
        return { status: 'done', message: `Influência registrada na proposta ${proposal.number} (${currentStage(proposal)}).` } as const;
      });
    },
  };
}
