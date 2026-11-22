import type { ProposalSummary } from '@/application/community-view.types';

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' });
const DATE_WITH_YEAR_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

/** "20 de novembro", with the year only when it is not the current one. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return (date.getFullYear() === new Date().getFullYear() ? DATE_FORMAT : DATE_WITH_YEAR_FORMAT).format(date);
}

export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso));
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export type NoteColor = 'yellow' | 'blue' | 'green' | 'paper';

/**
 * Shipped work is green and new or closed suggestions are plain taped paper. Everything else
 * alternates yellow and blue by number, so a note keeps its colour on every page.
 */
export function noteColor(proposal: Pick<ProposalSummary, 'stage' | 'number'>): NoteColor {
  if (proposal.stage === 'available') return 'green';
  if (proposal.stage === 'triage' || proposal.stage === 'archived' || proposal.stage === 'not_planned') return 'paper';
  return proposal.number % 2 === 0 ? 'blue' : 'yellow';
}

/** Keeps paragraphs from plain text without interpreting markup. */
export function paragraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}
