import type { ContributionFormState } from '@/components/proposal/contribution-form.types';
import { getCommunityServer } from './community-server.service';
import { ensureVoterHash } from './voter-session.service';

/** Shared by the server actions (with JavaScript) and the route handlers (without it). */

function proposalNumberFrom(formData: FormData): number {
  const number = Number(formData.get('proposalNumber'));
  if (!Number.isInteger(number) || number <= 0) throw new Error('Proposta inválida.');
  return number;
}

export async function voteFromForm(formData: FormData): Promise<{ proposalNumber: number }> {
  const proposalNumber = proposalNumberFrom(formData);
  const intent = formData.get('intent');
  // The community only upvotes; pressing the upvote again withdraws it.
  if (intent !== 'support') return { proposalNumber };
  const { votes } = await getCommunityServer();
  await votes.castVote({ proposalNumber, voterHash: await ensureVoterHash(), intent });
  return { proposalNumber };
}

export async function contributeFromForm(formData: FormData): Promise<ContributionFormState> {
  if (formData.get('website')) return { status: 'error', message: 'Não foi possível enviar o comentário.' };
  const { contributions, settings } = await getCommunityServer();
  if (!settings.durableData) return { status: 'error', message: 'Nesta versão de teste, comente diretamente no GitHub.' };
  try {
    const result = await contributions.submit({
      proposalNumber: proposalNumberFrom(formData),
      contributionId: formData.get('contributionId'),
      displayName: formData.get('displayName'),
      text: formData.get('text'),
    });
    if (result.status === 'closed') return { status: 'closed', message: 'Esta proposta foi arquivada e não recebe novos comentários.' };
    return result;
  } catch {
    return { status: 'error', message: 'Não foi possível guardar seu comentário agora. Seu texto continua no formulário. Tente de novo em instantes.' };
  }
}
