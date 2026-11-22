const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso)).replace('.', '');
}

export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso)).replace('.', '');
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function voteSummary(support: number, oppose: number): string {
  if (support === 0 && oppose === 0) return 'Ainda sem votos';
  return `${countLabel(support, 'a favor', 'a favor')} · ${countLabel(oppose, 'contra', 'contra')}`;
}

/** Keeps paragraphs from plain text without interpreting markup. */
export function paragraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}
