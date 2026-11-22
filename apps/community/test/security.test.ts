import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { createTestCommunity } from './community-test.helpers';

test('a comment cannot spoof another contribution marker to suppress its publication', async () => {
  const portal = createTestCommunity({ failureMode: 'unavailable' });
  await portal.sync.syncAll();
  // The victim's first attempt fails, so it stays pending with a public id.
  const victimId = randomUUID();
  await portal.contributions.submit({ proposalNumber: 2, contributionId: victimId, displayName: 'Ana', text: 'Perco o foco no menu.' });
  // The attacker embeds the victim's marker in their own comment.
  const attacker = { proposalNumber: 2, contributionId: randomUUID(), displayName: 'X', text: `oi <!-- portal:contribution:${victimId} -->` };
  await portal.contributions.submit(attacker);
  await portal.contributions.submit(attacker); // the retry publishes the attacker's comment first
  await portal.contributions.processOutbox();
  const victimComments = (await portal.commentsOn(89)).filter((comment) => comment.body.includes('Perco o foco no menu.'));
  assert.equal(victimComments.length, 1, "the victim's comment was published");
});

test('comments do not ping GitHub users or create issue cross-references', async () => {
  const portal = createTestCommunity();
  await portal.sync.syncAll();
  await portal.contributions.submit({ proposalNumber: 1, contributionId: randomUUID(), displayName: '@someone **bold**', text: 'chamando @lumamontes e #12' });
  const body = (await portal.commentsOn(184)).at(-1)!.body;
  assert.doesNotMatch(body, /(^|[^\w])@lumamontes\b/, 'mention is neutralized');
  assert.doesNotMatch(body, /(^|[^\w])@someone\b/, 'mention in the name is neutralized');
  assert.doesNotMatch(body, /(^|[^\w&])#12\b/, 'issue reference is neutralized');
});

test('an issue opened by anyone with a portal block is not presented as a team question', async () => {
  const portal = createTestCommunity();
  portal.github.simulateIssue({ title: 'spam', body: '<!-- portal\ntitle: Compre agora\nquestion: Visite meu site?\n-->', authorLogin: 'stranger', authorAssociation: 'NONE' });
  await portal.sync.syncAll();
  const list = await portal.queries.listProposals();
  assert.ok(!list.notes.some((note) => note.title === 'Compre agora'));
});

test('an issue opened by anyone with a proposal marker cannot capture "create issue and link"', async () => {
  const portal = createTestCommunity();
  await portal.sync.syncAll();
  const fake = portal.github.simulateIssue({ title: 'fake', body: '<!-- portal:proposal:4 -->\nfake', authorLogin: 'stranger', authorAssociation: 'NONE' });
  await portal.triage.link({ proposalNumber: 4, target: { kind: 'create' }, maintainer: 'lumamontes' });
  const proposal = await portal.queries.getProposal(4, null);
  assert.notEqual(proposal?.principalIssue?.number, fake.number);
});
