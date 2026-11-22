import type { DeliveryState } from '@/domain/proposal.types';

/** A `sending` claim older than this is treated as abandoned by a crashed request. */
export const STALE_SENDING_MS = 5 * 60 * 1000;

export const DELIVERY_MESSAGES: Readonly<Record<DeliveryState, string>> = {
  local: 'Comentário publicado neste portal.',
  pending: 'Comentário guardado. Ainda vamos publicá-lo no GitHub.',
  sending: 'Enviando para o GitHub…',
  sent: 'Comentário publicado no GitHub.',
  failed: 'Não foi possível confirmar a publicação no GitHub. Seu texto foi guardado. Tente de novo; ele não vai aparecer duas vezes.',
  cancelled: 'Envio cancelado pela moderação.',
};
