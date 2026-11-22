import { STAGE_LABEL } from '@/domain/stage.config';
import type { ProposalSummary } from '@/application/community-view.types';

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso));
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** One quiet line under each title: votes, comments, and the stage when it says something new. */
export function summaryLine(proposal: ProposalSummary): string {
  const votes = proposal.votes.support + proposal.votes.oppose;
  const stage = proposal.stage === 'discussion' || proposal.stage === 'triage' ? null : STAGE_LABEL[proposal.stage];
  return [
    stage,
    votes === 0 ? 'sem votos ainda' : countLabel(proposal.votes.support, 'voto a favor', 'votos a favor'),
    countLabel(proposal.contributionCount, 'comentário', 'comentários'),
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Keeps paragraphs from plain text without interpreting markup. */
export function paragraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}
