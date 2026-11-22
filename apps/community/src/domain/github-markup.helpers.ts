import type { OfficialResponseKind } from './proposal.types';

const OFFICIAL_HEADINGS: ReadonlyArray<[RegExp, OfficialResponseKind]> = [
  [/^#{1,6}\s*resposta da biblioteca( de zines)?\s*$/i, 'answer'],
  [/^#{1,6}\s*atualiza[cç][aã]o da biblioteca( de zines)?\s*$/i, 'update'],
  [/^#{1,6}\s*decis[aã]o da biblioteca( de zines)?\s*$/i, 'decision'],
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
  /** Slug of the catalogue's novidade that announced the result, when there is one. */
  update: string | null;
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
  const update = fields.get('update');
  // The slug ends up in a link to /publicacoes; accept only slug characters.
  return { title, question, openDecision: fields.get('open-decision') ?? null, update: update && /^[a-z0-9-]{1,100}$/.test(update) ? update : null };
}

const ZERO_WIDTH_SPACE = '\u200b';

/**
 * Community text goes into GitHub as markdown written by the portal bot. Neutralize what would
 * act on GitHub rather than read as text: HTML comments (which could imitate portal markers),
 * @mentions (which notify people) and #123 references (which write into other issues' timelines).
 */
export function neutralizeForGitHub(text: string): string {
  return text
    .replace(/<!--/g, '&lt;!--')
    .replace(/(^|[^\w`])@(?=[A-Za-z0-9-])/g, `$1@${ZERO_WIDTH_SPACE}`)
    .replace(/(^|[^\w&`])#(?=\d)/g, `$1#${ZERO_WIDTH_SPACE}`);
}

/** Display names are shown in bold; strip markdown and HTML syntax so a name stays a name. */
export function plainDisplayName(name: string): string {
  return neutralizeForGitHub(name.replace(/[*_~`[\]()<>|\\!]/g, '').trim()) || 'Pessoa da comunidade';
}

export function contributionCommentBody(input: {
  contributionId: string;
  displayName: string;
  text: string;
  proposalUrl: string;
}): string {
  const quoted = neutralizeForGitHub(input.text).split('\n').map((line) => `> ${line}`).join('\n');
  return [
    contributionMarker(input.contributionId),
    `**${plainDisplayName(input.displayName)}** comentou pela [comunidade da Biblioteca de Zines](${input.proposalUrl}):`,
    '',
    quoted,
  ].join('\n');
}

export function moderatedCommentBody(contributionId: string, moderatedAtLabel: string): string {
  return `${contributionMarker(contributionId)}\n_Contribuição removida pela moderação da Biblioteca de Zines em ${moderatedAtLabel}._`;
}

export function linkCommentBody(input: { proposalNumber: number; proposalUrl: string; votesFor: number; votesAgainst: number; contributionCount: number }): string {
  return [
    proposalMarker(input.proposalNumber),
    `Esta issue acompanha a [proposta pública nº ${input.proposalNumber}](${input.proposalUrl}) na comunidade da Biblioteca de Zines.`,
    '',
    `No momento do vínculo: ${input.votesFor} votos a favor, ${input.votesAgainst} contra e ${input.contributionCount} contribuições.`,
    'Novos comentários feitos pelo portal aparecerão aqui. Respostas oficiais começam com `### Resposta da Biblioteca de Zines`, `### Atualização da Biblioteca de Zines` ou `### Decisão da Biblioteca de Zines`.',
  ].join('\n');
}
