'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { InfluenceKind } from '@/domain/proposal.types';
import { withBasePath } from '@/app/base-path.helpers';
import { GitHubUnavailableError } from '@/application/github-unavailable.error';
import type { TriageResult } from '@/application/triage.service';
import { LOCAL_MAINTAINER } from '@/composition/server/community-server.config';
import { getCommunityServer, isTriageEnabled } from '@/composition/server/community-server.service';
import { FLASH_COOKIE, INFLUENCE_KINDS, SIMULATED_AUTHORS, SIMULATED_HEADINGS, STAGE_LABEL_OPTIONS } from '@/components/triage/triage.config';

async function requireTriage() {
  if (!(await isTriageEnabled())) throw new Error('Triagem indisponível.');
  return getCommunityServer();
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function numberField(formData: FormData, name: string): number {
  const value = Number(field(formData, name).replace(/^#/, ''));
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Número inválido em ${name}.`);
  return value;
}

/** GitHub failures become a visible, retryable message; every triage operation is safe to repeat. */
async function attempt(operation: () => Promise<TriageResult>): Promise<TriageResult> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof GitHubUnavailableError) {
      return { status: 'rejected', message: `${error.message} Tente de novo: repetir a operação não cria issues nem comentários duplicados.` };
    }
    throw error;
  }
}

async function finish(result: TriageResult): Promise<never> {
  (await cookies()).set(FLASH_COOKIE, JSON.stringify(result), { httpOnly: true, sameSite: 'lax', maxAge: 30, path: withBasePath('/triage') });
  revalidatePath('/', 'layout');
  redirect('/triage');
}

export async function linkAction(formData: FormData) {
  const { triage } = await requireTriage();
  const mode = field(formData, 'mode');
  const proposalNumber = numberField(formData, 'proposalNumber');
  const target = mode === 'create' ? ({ kind: 'create' } as const) : ({ kind: 'existing', issueNumber: numberField(formData, 'issueNumber') } as const);
  await finish(await attempt(() => triage.link({ proposalNumber, target, maintainer: LOCAL_MAINTAINER })));
}

export async function archiveAction(formData: FormData) {
  const { triage } = await requireTriage();
  await finish(await triage.archive({ proposalNumber: numberField(formData, 'proposalNumber'), reason: field(formData, 'reason'), maintainer: LOCAL_MAINTAINER }));
}

export async function reopenArchivedAction(formData: FormData) {
  const { triage } = await requireTriage();
  await finish(await triage.reopenArchived({ proposalNumber: numberField(formData, 'proposalNumber') }));
}

export async function relatedTaskAction(formData: FormData) {
  const { triage } = await requireTriage();
  const input = { proposalNumber: numberField(formData, 'proposalNumber'), issueNumber: numberField(formData, 'issueNumber') };
  await finish(await attempt(() => triage.addRelatedTask(input)));
}

export async function moderateAction(formData: FormData) {
  const { triage } = await requireTriage();
  const input = { contributionId: field(formData, 'contributionId'), reason: field(formData, 'reason'), maintainer: LOCAL_MAINTAINER };
  await finish(await attempt(() => triage.moderate(input)));
}

export async function influenceAction(formData: FormData) {
  const { triage } = await requireTriage();
  const kind = field(formData, 'kind') as InfluenceKind;
  if (!INFLUENCE_KINDS.includes(kind)) throw new Error('Tipo de influência inválido.');
  await finish(await triage.recordInfluence({ contributionId: field(formData, 'contributionId'), kind, note: field(formData, 'note'), maintainer: LOCAL_MAINTAINER }));
}

export async function retryDeliveriesAction() {
  const { contributions } = await requireTriage();
  const outcome = await contributions.processOutbox();
  await finish({ status: 'done', message: `${outcome.attempted} envio(s) processado(s): ${outcome.sent} publicado(s), ${outcome.failed} com falha.` });
}

export async function syncAllAction() {
  const { sync } = await requireTriage();
  const outcome = await sync.syncAll(); // syncAll already counts per-proposal failures.
  await finish({ status: 'done', message: `Sincronização concluída: ${outcome.synced} proposta(s) atualizada(s), ${outcome.imported} pergunta(s) nova(s).` });
}

/** Local simulator: acts on the simulated GitHub the way a maintainer or the deploy would. */
export async function simulateGitHubAction(formData: FormData) {
  const { fixtureGitHub, sync } = await requireTriage();
  const proposalNumber = numberField(formData, 'proposalNumber');
  const issueNumber = numberField(formData, 'issueNumber');
  const operation = field(formData, 'operation');

  if (operation === 'comment') {
    const heading = SIMULATED_HEADINGS[field(formData, 'kind') as keyof typeof SIMULATED_HEADINGS];
    const author = SIMULATED_AUTHORS.find((item) => item.login === field(formData, 'author'));
    const body = field(formData, 'body');
    if (!heading || !author || !body) await finish({ status: 'rejected', message: 'Escolha o tipo, a autoria e escreva o comentário.' });
    fixtureGitHub.simulateComment(issueNumber, { authorLogin: author!.login, authorAssociation: author!.association, body: `${heading}\n${body}` });
  } else if (operation === 'label') {
    const label = field(formData, 'label');
    if (!STAGE_LABEL_OPTIONS.some((option) => option.value === label)) throw new Error('Rótulo inválido.');
    fixtureGitHub.simulateSetStageLabel(issueNumber, label || null);
  } else if (operation === 'close-completed') {
    fixtureGitHub.simulateClose(issueNumber, 'completed');
  } else if (operation === 'close-not-planned') {
    fixtureGitHub.simulateClose(issueNumber, 'not_planned');
  } else if (operation === 'reopen') {
    fixtureGitHub.simulateReopen(issueNumber);
  } else if (operation === 'release') {
    fixtureGitHub.simulateRelease(issueNumber, 'https://biblioteca-de-zines.com.br');
  } else if (operation === 'delete-comment') {
    fixtureGitHub.simulateDeleteComment(numberField(formData, 'commentId'));
  } else {
    throw new Error('Operação desconhecida.');
  }

  await sync.syncProposal(proposalNumber);
  await finish({ status: 'done', message: `GitHub simulado atualizado na issue #${issueNumber} e proposta ${proposalNumber} sincronizada.` });
}
