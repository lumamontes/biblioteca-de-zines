import type { Contribution } from '@/domain/proposal.types';
import { STALE_SENDING_MS } from './contribution.config';

export function formatModerationDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
}

/** Pending and failed deliveries can be claimed; a `sending` claim only after it is abandoned. */
export function isDeliverable(contribution: Pick<Contribution, 'delivery'>, nowMs: number): boolean {
  const { state, lastAttemptAt } = contribution.delivery;
  if (state === 'pending' || state === 'failed') return true;
  return state === 'sending' && lastAttemptAt !== null && nowMs - Date.parse(lastAttemptAt) > STALE_SENDING_MS;
}
