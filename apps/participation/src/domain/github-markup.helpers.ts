import type { OfficialResponseKind } from './proposal.types';

const OFFICIAL_HEADINGS: ReadonlyArray<[RegExp, OfficialResponseKind]> = [
  [/^#{1,6}\s*resposta da biblioteca\s*$/i, 'answer'],
  [/^#{1,6}\s*atualiza[cç][aã]o da biblioteca\s*$/i, 'update'],
  [/^#{1,6}\s*decis[aã]o da biblioteca\s*$/i, 'decision'],
];

function firstContentLine(body: string): { line: string; rest: string } {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const index = lines.findIndex((line) => line.trim() !== '' && !/^<!--.*-->$/.test(line.trim()));
  if (index === -1) return { line: '', rest: '' };
  return { line: lines[index].trim(), rest: lines.slice(index + 1).join('\n').trim() };
}

export function parseOfficialResponse(body: string): { kind: OfficialResponseKind; text: string } | null {
  const { line, rest } = firstContentLine(body);
  for (const [pattern, kind] of OFFICIAL_HEADINGS) {
    if (pattern.test(line)) return { kind, text: rest };
  }
  return null;
}

/** Splits a decision body into its justification and an optional "Próximos passos" section. */
export function splitDecision(text: string): { justification: string; nextSteps: string | null } {
  const match = /^#{1,6}\s*pr[oó]ximos passos\s*$/im.exec(text);
  if (!match) return { justification: text.trim(), nextSteps: null };
  return {
    justification: text.slice(0, match.index).trim(),
    nextSteps: text.slice(match.index + match[0].length).trim() || null,
  };
}

export function contributionMarker(contributionId: string): string {
  return `<!-- portal:contribution:${contributionId} -->`;
}

export function proposalMarker(proposalNumber: number): string {
  return `<!-- portal:proposal:${proposalNumber} -->`;
}

export function hasPortalMarker(body: string): boolean {
  return /<!--\s*portal:(contribution|proposal):/.test(body);
}

export type PortalBlock = {
  title: string;
  question: string;
  openDecision: string | null;
};

/** Reads the hidden `<!-- portal ... -->` block that maintainers add to an issue body. */
export function parsePortalBlock(issueBody: string): PortalBlock | null {
  const match = /<!--\s*portal\s*\n([\s\S]*?)-->/.exec(issueBody);
  if (!match) return null;
  const fields = new Map<string, string>();
  for (const rawLine of match[1].split('\n')) {
    const fieldMatch = /^\s*([a-z-]+)\s*:\s*(.+?)\s*$/.exec(rawLine);
    if (fieldMatch) fields.set(fieldMatch[1], fieldMatch[2]);
  }
  const title = fields.get('title');
  const question = fields.get('question');
  if (!title || !question) return null;
  return { title, question, openDecision: fields.get('open-decision') ?? null };
}

export function contributionCommentBody(input: {
  contributionId: string;
  displayName: string;
  text: string;
  proposalUrl: string;
}): string {
  const quoted = input.text.split('\n').map((line) => `> ${line}`).join('\n');
  return [
    contributionMarker(input.contributionId),
    `**${input.displayName}** comentou pelo [portal de participação](${input.proposalUrl}):`,
    '',
    quoted,
  ].join('\n');
}

export function moderatedCommentBody(contributionId: string, moderatedAtLabel: string): string {
  return `${contributionMarker(contributionId)}\n_Contribuição removida pela moderação da Biblioteca em ${moderatedAtLabel}._`;
}

export function linkCommentBody(input: { proposalNumber: number; proposalUrl: string; votesFor: number; votesAgainst: number; contributionCount: number }): string {
  return [
    proposalMarker(input.proposalNumber),
    `Esta issue acompanha a [proposta pública nº ${input.proposalNumber}](${input.proposalUrl}) no portal de participação.`,
    '',
    `No momento do vínculo: ${input.votesFor} votos a favor, ${input.votesAgainst} contra e ${input.contributionCount} contribuições.`,
    'Novos comentários feitos pelo portal aparecerão aqui. Respostas oficiais começam com `### Resposta da Biblioteca`, `### Atualização da Biblioteca` ou `### Decisão da Biblioteca`.',
  ].join('\n');
}
