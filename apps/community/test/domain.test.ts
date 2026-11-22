import assert from 'node:assert/strict';
import test from 'node:test';
import { parseOfficialResponse, parsePortalBlock, splitDecision } from '@/domain/github-markup.helpers';
import { parseProposalSegment, proposalPath, slugify } from '@/domain/proposal-path.helpers';
import { deriveStageFromIssue, isVotingOpen } from '@/domain/stage.service';
import { resolveVote, tallyVotes } from '@/domain/voting.service';

const openIssue = { state: 'open' as const, stateReason: null, labels: [] as string[], release: null, officialResponses: [] };

test('paths resolve by number so renamed titles keep shared links working', () => {
  assert.equal(slugify('O que você gostaria de conferir antes de enviar sua zine?'), 'o-que-voce-gostaria-de-conferir-antes-de-enviar-sua-zine');
  assert.equal(proposalPath(1, 'Créditos & capa'), '/proposals/1-creditos-capa');
  assert.equal(parseProposalSegment('1-o-titulo-antigo'), 1);
  assert.equal(parseProposalSegment('12'), 12);
  assert.equal(parseProposalSegment('abc'), null);
  assert.equal(parseProposalSegment('0-zero'), null);
  assert.ok(slugify('a'.repeat(200)).length <= 80);
});

test('derives one public stage from labels, state and release confirmation', () => {
  assert.equal(deriveStageFromIssue(openIssue).stage, 'discussion');
  assert.equal(deriveStageFromIssue({ ...openIssue, labels: ['portal:in-progress'] }).stage, 'in_progress');

  const decidedWithoutReason = deriveStageFromIssue({ ...openIssue, labels: ['portal:decided'] });
  assert.equal(decidedWithoutReason.stage, 'decided');
  assert.deepEqual(decidedWithoutReason.warnings, ['decision_without_justification']);
  assert.deepEqual(deriveStageFromIssue({ ...openIssue, labels: ['portal:decided'], officialResponses: [{ kind: 'decision' }] }).warnings, []);

  const closedWithoutRelease = deriveStageFromIssue({ ...openIssue, state: 'closed', stateReason: 'completed' });
  assert.equal(closedWithoutRelease.stage, 'in_progress');
  assert.equal(closedWithoutRelease.awaitingRelease, true);

  const released = deriveStageFromIssue({ ...openIssue, state: 'closed', stateReason: 'completed', release: { confirmedAt: '2026-11-21T00:00:00Z', environment: 'Production', url: null } });
  assert.equal(released.stage, 'available');
  assert.equal(isVotingOpen(released.stage), false);

  assert.equal(deriveStageFromIssue({ ...openIssue, state: 'closed', stateReason: 'not_planned', officialResponses: [{ kind: 'decision' }] }).stage, 'not_planned');
});

test('flags inconsistent labels instead of trusting them', () => {
  const terminalOnOpen = deriveStageFromIssue({ ...openIssue, labels: ['portal:not-planned'] });
  assert.equal(terminalOnOpen.stage, 'discussion');
  assert.ok(terminalOnOpen.warnings.includes('terminal_label_on_open_issue'));

  const several = deriveStageFromIssue({ ...openIssue, labels: ['portal:discussion', 'portal:in-progress'] });
  assert.equal(several.stage, 'in_progress');
  assert.ok(several.warnings.includes('multiple_stage_labels'));
});

test('reads the official response convention from the first line only', () => {
  assert.deepEqual(parseOfficialResponse('### Resposta da Biblioteca de Zines\nObrigada!'), { kind: 'answer', text: 'Obrigada!' });
  assert.equal(parseOfficialResponse('### Resposta da Biblioteca\nForma curta antiga.')?.kind, 'answer');
  assert.equal(parseOfficialResponse('## Decisão da Biblioteca\nVamos fazer.')?.kind, 'decision');
  assert.equal(parseOfficialResponse('#### atualizacao da biblioteca\nx')?.kind, 'update');
  assert.equal(parseOfficialResponse('Olá\n### Resposta da Biblioteca'), null);
  assert.deepEqual(splitDecision('Vamos fazer.\n\n#### Próximos passos\nTestar no celular.'), { justification: 'Vamos fazer.', nextSteps: 'Testar no celular.' });
});

test('reads the hidden portal block that presents an issue to the community', () => {
  const block = parsePortalBlock('<!-- portal\ntitle: Título público\nquestion: Pergunta?\nopen-decision: O que decidir.\n-->\nCorpo técnico');
  assert.deepEqual(block, { title: 'Título público', question: 'Pergunta?', openDecision: 'O que decidir.', update: null });
  assert.equal(parsePortalBlock('<!-- portal\ntitle: T\nquestion: Q?\nupdate: leitura-com-mais-contraste\n-->')?.update, 'leitura-com-mais-contraste');
  assert.equal(parsePortalBlock('<!-- portal\ntitle: Sem pergunta\n-->'), null);
  assert.equal(parsePortalBlock('Corpo sem bloco'), null);
});

test('choosing the active vote again withdraws it', () => {
  assert.equal(resolveVote(null, 'support'), 1);
  assert.equal(resolveVote(1, 'support'), null);
  assert.equal(resolveVote(1, 'oppose'), -1);
  assert.deepEqual(tallyVotes([{ value: 1 }, { value: 1 }, { value: -1 }]), { support: 2, oppose: 1 });
});

test('the app base path matches next.config.ts', async () => {
  const { readFileSync } = await import('node:fs');
  const { BASE_PATH } = await import('@/app/base-path.config');
  assert.match(readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8'), new RegExp(`const BASE_PATH = '${BASE_PATH}'`));
});
