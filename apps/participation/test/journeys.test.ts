import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { createTestParticipation } from './participation-test.helpers';

const COMMENT = 'Quero conferir se o nome do coletivo aparece nos créditos';

test('journey A: a lost confirmation and a retry deliver one comment; the answer and stage reach the same address', async () => {
  const portal = createTestParticipation({ failureMode: 'lost-confirmation' });
  await portal.sync.syncAll();

  const before = await portal.queries.getProposal(1, null);
  assert.equal(before?.title, 'O que você gostaria de conferir antes de enviar sua zine?');
  assert.equal(before?.stage, 'discussion');
  assert.equal(before?.canonicalPath, '/proposals/1-o-que-voce-gostaria-de-conferir-antes-de-enviar-sua-zine');
  const commentsBefore = (await portal.commentsOn(184)).length;

  const contributionId = randomUUID();
  const first = await portal.contributions.submit({ proposalNumber: 1, contributionId, displayName: 'Coletivo Maré', text: COMMENT });
  assert.equal(first.status, 'saved');
  assert.equal(first.status === 'saved' && first.delivery, 'failed', 'the person sees a recoverable failure');

  // GitHub created the comment even though the portal never heard back.
  assert.equal((await portal.commentsOn(184)).length, commentsBefore + 1);

  const retry = await portal.contributions.submit({ proposalNumber: 1, contributionId, displayName: 'Coletivo Maré', text: COMMENT });
  assert.equal(retry.status === 'saved' && retry.delivery, 'sent');
  const comments = await portal.commentsOn(184);
  assert.equal(comments.filter((comment) => comment.body.includes(contributionId)).length, 1, 'exactly one comment for the contribution');
  assert.equal(comments.length, commentsBefore + 1);

  // The team answers and changes the stage on GitHub.
  portal.github.simulateComment(184, { authorLogin: 'lumamontes', authorAssociation: 'OWNER', body: '### Decisão da Biblioteca\nA prévia vai mostrar a capa e os créditos primeiro.\n\n#### Próximos passos\nTestar com três coletivos.' });
  portal.github.simulateSetStageLabel(184, 'portal:decided');
  await portal.sync.syncProposal(1);

  const after = await portal.queries.getProposal(1, null);
  assert.equal(after?.canonicalPath, before?.canonicalPath, 'same address');
  assert.equal(after?.stage, 'decided');
  assert.equal(after?.decision?.justification, 'A prévia vai mostrar a capa e os créditos primeiro.');
  assert.equal(after?.decision?.nextSteps, 'Testar com três coletivos.');
  const mine = after?.contributions.find((contribution) => contribution.id === contributionId);
  assert.equal(mine?.delivery, 'sent');
  assert.match(mine?.githubUrl ?? '', /issuecomment-/);
});

test('journey B: a portal suggestion keeps its address and history when linked; repeating the link creates nothing; moderation reaches both surfaces', async () => {
  const portal = createTestParticipation();
  await portal.sync.syncAll();

  const created = await portal.suggestions.suggest({ title: 'Filtrar zines pelo nome do coletivo', report: 'Quero achar todas as zines do coletivo.', displayName: 'Rafa' });
  assert.equal(created.status, 'created');
  if (created.status !== 'created') return;
  const number = created.number;

  await portal.votes.castVote({ proposalNumber: number, voterHash: 'voter-a', intent: 'support' });
  await portal.votes.castVote({ proposalNumber: number, voterHash: 'voter-b', intent: 'support' });
  await portal.votes.castVote({ proposalNumber: number, voterHash: 'voter-b', intent: 'oppose' });
  await portal.votes.castVote({ proposalNumber: number, voterHash: 'voter-c', intent: 'support' });
  await portal.votes.castVote({ proposalNumber: number, voterHash: 'voter-c', intent: 'support' }); // withdrawn
  const local = await portal.contributions.submit({ proposalNumber: number, contributionId: randomUUID(), displayName: 'Jo', text: 'Coletivos mudam de nome.' });
  assert.equal(local.status === 'saved' && local.delivery, 'local', 'before the link, the conversation lives in the portal');

  const before = await portal.queries.getProposal(number, 'voter-a');
  assert.deepEqual(before?.votes, { support: 1, oppose: 1 });
  assert.equal(before?.viewerVote, 1);
  assert.equal(before?.stage, 'triage');

  const issueCommentsBefore = (await portal.commentsOn(186)).length;
  const linked = await portal.triage.link({ proposalNumber: number, target: { kind: 'existing', issueNumber: 186 }, maintainer: 'lumamontes' });
  assert.equal(linked.status, 'done');
  const again = await portal.triage.link({ proposalNumber: number, target: { kind: 'existing', issueNumber: 186 }, maintainer: 'lumamontes' });
  assert.equal(again.status, 'done');

  const issueComments = await portal.commentsOn(186);
  assert.equal(issueComments.length, issueCommentsBefore + 1, 'one link comment, even after repeating the operation');
  assert.match(issueComments.at(-1)!.body, new RegExp(`participe\\.example/proposals/${number}-`));

  const after = await portal.queries.getProposal(number, 'voter-a');
  assert.equal(after?.canonicalPath, before?.canonicalPath);
  assert.deepEqual(after?.votes, before?.votes);
  assert.equal(after?.contributions.length, 1);
  assert.equal(after?.principalIssue?.number, 186);
  assert.equal(after?.stage, 'discussion');

  // After the link, a new contribution goes to the issue; then the team moderates it.
  const posted = await portal.contributions.submit({ proposalNumber: number, contributionId: randomUUID(), displayName: 'Troll', text: 'Conteúdo inadequado' });
  assert.equal(posted.status === 'saved' && posted.delivery, 'sent');
  const postedId = posted.status === 'saved' ? posted.contributionId : '';
  const moderated = await portal.triage.moderate({ contributionId: postedId, reason: 'spam', maintainer: 'lumamontes' });
  assert.equal(moderated.status, 'done');

  const view = await portal.queries.getProposal(number, null);
  const hidden = view?.contributions.find((contribution) => contribution.id === postedId);
  assert.equal(hidden?.hidden, true);
  assert.equal(hidden?.text, null, 'the portal no longer shows the text');
  const githubCopy = (await portal.commentsOn(186)).find((comment) => comment.body.includes(postedId));
  assert.match(githubCopy!.body, /removida pela moderação/);
  assert.doesNotMatch(githubCopy!.body, /inadequado/);
});

test('creating an issue is idempotent even when the link fails halfway', async () => {
  const portal = createTestParticipation({ failureMode: 'unavailable' });
  await portal.sync.syncAll();
  const first = await portal.triage.link({ proposalNumber: 4, target: { kind: 'create' }, maintainer: 'lumamontes' }).catch((error: Error) => error);
  assert.ok(first instanceof Error, 'the link comment failed after the issue was created');
  const issuesAfterFailure = await portal.github.findIssueByMarker('<!-- portal:proposal:4 -->');
  assert.ok(issuesAfterFailure);

  const second = await portal.triage.link({ proposalNumber: 4, target: { kind: 'create' }, maintainer: 'lumamontes' });
  assert.equal(second.status, 'done');
  const proposal = await portal.queries.getProposal(4, null);
  assert.equal(proposal?.principalIssue?.number, issuesAfterFailure.number, 'reused the issue created by the first attempt');
});

test('only authorized maintainers answer officially, and earlier answers survive loss of access', async () => {
  const portal = createTestParticipation();
  await portal.sync.syncAll();
  portal.github.simulateComment(89, { authorLogin: 'visitante-qualquer', authorAssociation: 'NONE', body: '### Resposta da Biblioteca\nNão sou da equipe.' });
  portal.github.simulateComment(89, { authorLogin: 'lumamontes', authorAssociation: 'OWNER', body: '### Resposta da Biblioteca\nVamos testar com leitor de tela.' });
  await portal.sync.syncProposal(2);

  let proposal = await portal.queries.getProposal(2, null);
  assert.deepEqual(proposal?.responses.map((response) => response.authorLogin), ['lumamontes']);
  const triage = await portal.triage.overview();
  assert.ok(triage.linked.find((item) => item.summary.number === 2)?.warnings.includes('unauthorized_official_marker'));

  // Lose access: rebuild with no maintainers, sharing the same repository and GitHub.
  const { createSyncService } = await import('@/application/sync.service');
  const sync = createSyncService({ repository: portal.repository, github: portal.github, config: { publicOrigin: 'https://participe.example', maintainers: [], voterSecret: 'x' }, clock: () => new Date(), newId: randomUUID });
  await sync.syncProposal(2);
  proposal = await portal.queries.getProposal(2, null);
  assert.deepEqual(proposal?.responses.map((response) => response.authorLogin), ['lumamontes']);
});

test('a portal comment deleted on GitHub is hidden in the portal too', async () => {
  const portal = createTestParticipation();
  await portal.sync.syncAll();
  portal.github.simulateDeleteComment(9001);
  await portal.sync.syncProposal(1);
  const proposal = await portal.queries.getProposal(1, null);
  const removed = proposal?.contributions.find((contribution) => contribution.displayName === 'Bia Xerox');
  assert.equal(removed?.hidden, true);
});

test('editing the public title on GitHub changes the slug and records the earlier question', async () => {
  const portal = createTestParticipation();
  await portal.sync.syncAll();
  const issue = await portal.github.getIssue(184);
  portal.github.simulateEditBody(184, issue!.body.replace('title: O que você gostaria de conferir antes de enviar sua zine?', 'title: O que conferir antes de enviar?'));
  await portal.sync.syncProposal(1);
  const proposal = await portal.queries.getProposal(1, null);
  assert.equal(proposal?.canonicalPath, '/proposals/1-o-que-conferir-antes-de-enviar');
  assert.equal(proposal?.questionRevisions.at(-1)?.publicTitle, 'O que você gostaria de conferir antes de enviar sua zine?');
});

test('the list keeps team questions with few votes visible ahead of popular ones', async () => {
  const portal = createTestParticipation();
  await portal.sync.syncAll();
  const list = await portal.queries.listProposals('support');
  assert.deepEqual(list.featured.map((item) => item.number), [1, 2]);
  assert.equal(list.featured[1].votes.support, 0, '#89 has no votes and still comes first');
  assert.deepEqual(list.suggestions.map((item) => item.number), [4]);
  assert.deepEqual(list.decided.map((item) => item.number), [3]);
  assert.equal(list.decided[0].stage, 'available');
});

test('votes close on terminal stages and the outbox retry is safe to repeat', async () => {
  const portal = createTestParticipation({ failureMode: 'unavailable' });
  await portal.sync.syncAll();
  const closed = await portal.votes.castVote({ proposalNumber: 3, voterHash: 'v', intent: 'support' });
  assert.equal(closed.status, 'closed');

  const id = randomUUID();
  const result = await portal.contributions.submit({ proposalNumber: 2, contributionId: id, displayName: 'Ana', text: 'Perco o foco no menu.' });
  assert.equal(result.status === 'saved' && result.delivery, 'failed');
  assert.equal((await portal.commentsOn(89)).length, 0, 'nothing reached GitHub');
  assert.deepEqual(await portal.contributions.processOutbox(), { attempted: 1, sent: 1, failed: 0 });
  assert.deepEqual(await portal.contributions.processOutbox(), { attempted: 0, sent: 0, failed: 0 });
  assert.equal((await portal.commentsOn(89)).length, 1);
});
