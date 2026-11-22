import { hasPortalMarker, parseOfficialResponse, parsePortalBlock } from '@/domain/github-markup.helpers';
import { FEATURED_LABEL } from '@/domain/stage.config';
import { deriveStageFromIssue } from '@/domain/stage.service';
import type { OfficialResponse, Proposal, StageWarning } from '@/domain/proposal.types';
import { MAINTAINER_ASSOCIATIONS } from './sync.config';
import { findProposal } from './community-state.helpers';
import type { GitHubIssueSnapshot, CommunityDependencies, CommunityState } from './community.types';

function officialResponsesFrom(
  snapshot: GitHubIssueSnapshot,
  previous: readonly OfficialResponse[],
  maintainers: ReadonlySet<string>,
  now: string,
): { responses: OfficialResponse[]; unauthorizedMarker: boolean } {
  let unauthorizedMarker = false;
  const responses: OfficialResponse[] = [];
  for (const comment of snapshot.comments) {
    if (comment.isPortalBot || hasPortalMarker(comment.body)) continue;
    const parsed = parseOfficialResponse(comment.body);
    if (!parsed) continue;
    const earlier = previous.find((response) => response.githubCommentId === comment.id);
    const authorizedNow = maintainers.has(comment.authorLogin.toLowerCase()) && MAINTAINER_ASSOCIATIONS.has(comment.authorAssociation);
    // A response verified while its author was a maintainer stays official after access is lost.
    if (!authorizedNow && !earlier) {
      unauthorizedMarker = true;
      continue;
    }
    responses.push({
      githubCommentId: comment.id,
      url: comment.url,
      kind: parsed.kind,
      authorLogin: comment.authorLogin,
      body: parsed.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      verifiedAt: earlier?.verifiedAt ?? now,
    });
  }
  return { responses, unauthorizedMarker };
}

/** A `portal` block is trusted only on issues written by a maintainer, who are the only ones (with the author) able to edit it. */
function trustedPortalBlock(snapshot: GitHubIssueSnapshot, maintainers: ReadonlySet<string>) {
  const writtenByMaintainer = maintainers.has(snapshot.authorLogin.toLowerCase()) && MAINTAINER_ASSOCIATIONS.has(snapshot.authorAssociation);
  return writtenByMaintainer ? parsePortalBlock(snapshot.body) : null;
}

function applySnapshot(state: CommunityState, proposal: Proposal, snapshot: GitHubIssueSnapshot, maintainers: ReadonlySet<string>, now: string) {
  const block = trustedPortalBlock(snapshot, maintainers);
  if (block) {
    const changed = block.title !== proposal.publicTitle || block.question !== proposal.publicQuestion;
    // Only record a revision when the earlier text was ever public (team rows start empty until the first sync).
    if (changed && proposal.publicQuestion !== '') {
      proposal.questionRevisions.push({ publicTitle: proposal.publicTitle, publicQuestion: proposal.publicQuestion, replacedAt: now });
    }
    proposal.publicTitle = block.title;
    proposal.publicQuestion = block.question;
    proposal.openDecision = block.openDecision;
    proposal.updateSlug = block.update;
    proposal.presentedByTeam = true;
  } else if (proposal.origin === 'team') {
    proposal.presentedByTeam = false;
  }

  const previousResponses = proposal.cache?.officialResponses ?? [];
  const { responses, unauthorizedMarker } = officialResponsesFrom(snapshot, previousResponses, maintainers, now);
  const derived = deriveStageFromIssue({
    state: snapshot.state,
    stateReason: snapshot.stateReason,
    labels: snapshot.labels,
    release: snapshot.release,
    officialResponses: responses,
  });
  const warnings: StageWarning[] = unauthorizedMarker ? [...derived.warnings, 'unauthorized_official_marker'] : derived.warnings;

  // The first sync only fills the cache; later changes count as new activity.
  const hasNewResponse = responses.some((response) => !previousResponses.some((earlier) => earlier.githubCommentId === response.githubCommentId && earlier.updatedAt === response.updatedAt));
  if (proposal.cache && hasNewResponse) {
    proposal.lastActivityAt = now;
  }
  if (proposal.cache && proposal.cache.stage !== derived.stage) proposal.lastActivityAt = now;

  proposal.featured = snapshot.labels.includes(FEATURED_LABEL);
  proposal.principalIssue = proposal.principalIssue ? { ...proposal.principalIssue, technicalTitle: snapshot.title, url: snapshot.url } : proposal.principalIssue;
  proposal.cache = {
    stage: derived.stage,
    warnings,
    awaitingRelease: derived.awaitingRelease,
    issueState: snapshot.state,
    issueStateReason: snapshot.stateReason,
    officialResponses: responses,
    pullRequests: snapshot.pullRequests,
    release: snapshot.release,
    syncedAt: now,
  };

  // A portal comment deleted on GitHub by the team is treated as moderated in the portal too.
  const commentIds = new Set(snapshot.comments.map((comment) => comment.id));
  for (const contribution of state.contributions) {
    if (contribution.proposalNumber !== proposal.number || contribution.delivery.githubCommentId === null) continue;
    if (contribution.delivery.issueNumber !== snapshot.number) continue;
    if (!commentIds.has(contribution.delivery.githubCommentId) && contribution.moderation.state === 'visible') {
      contribution.moderation = { state: 'deleted_on_github', reason: 'Comentário apagado no GitHub.', moderatedAt: now, moderatedBy: null };
    }
  }
}

export function createSyncService({ repository, github, config, clock }: CommunityDependencies) {
  const maintainers = new Set(config.maintainers.map((login) => login.toLowerCase()));

  async function syncProposal(number: number): Promise<'synced' | 'not_linked' | 'issue_missing'> {
    const proposal = findProposal(await repository.read(), number);
    if (!proposal?.principalIssue) return 'not_linked';
    // The snapshot is always fetched fresh, so late or out-of-order webhooks cannot overwrite newer data.
    const snapshot = await github.getIssue(proposal.principalIssue.number);
    if (!snapshot) return 'issue_missing';
    await repository.update((state) => {
      const current = findProposal(state, number);
      if (current?.principalIssue?.number === snapshot.number) applySnapshot(state, current, snapshot, maintainers, clock().toISOString());
    });
    return 'synced';
  }

  return {
    syncProposal,

    /** Imports issues the team presents with a `portal` block and refreshes every linked proposal. */
    async syncAll(): Promise<{ imported: number; synced: number; failed: number }> {
      const presented = await github.listIssuesWithPortalBlock();
      let imported = 0;
      for (const issueNumber of presented) {
        const known = (await repository.read()).proposals.some((proposal) => proposal.principalIssue?.number === issueNumber);
        if (known) continue;
        const snapshot = await github.getIssue(issueNumber);
        const block = snapshot ? trustedPortalBlock(snapshot, maintainers) : null;
        if (!snapshot || !block) continue;
        const now = clock().toISOString();
        await repository.update((state) => {
          if (state.proposals.some((proposal) => proposal.principalIssue?.number === issueNumber)) return;
          state.proposals.push({
            number: state.nextProposalNumber,
            origin: 'team',
            publicTitle: block.title,
            publicQuestion: block.question,
            openDecision: block.openDecision,
            originalReport: null,
            createdAt: now,
            lastActivityAt: now,
            featured: false,
            triageState: 'linked',
            archive: null,
            principalIssue: { number: snapshot.number, url: snapshot.url, technicalTitle: snapshot.title, linkedAt: now, linkCommentUrl: null },
            relatedTasks: [],
            questionRevisions: [],
            presentedByTeam: true,
            cache: null,
          });
          state.nextProposalNumber += 1;
          imported += 1;
        });
      }

      let synced = 0;
      let failed = 0;
      const linked = (await repository.read()).proposals.filter((proposal) => proposal.principalIssue);
      for (const proposal of linked) {
        try {
          if ((await syncProposal(proposal.number)) === 'synced') synced += 1;
        } catch {
          failed += 1;
        }
      }
      return { imported, synced, failed };
    },
  };
}
