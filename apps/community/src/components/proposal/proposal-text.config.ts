import type { DeliveryState, OfficialResponseKind, PullRequestReference } from '@/domain/proposal.types';

export const RESPONSE_KIND_LABEL: Readonly<Record<OfficialResponseKind, string>> = {
  answer: 'Resposta da Biblioteca de Zines',
  update: 'Atualização da Biblioteca de Zines',
  decision: 'Decisão da Biblioteca de Zines',
};

/** Shown under a comment only when it says something useful. */
export const DELIVERY_LABEL: Readonly<Record<DeliveryState, string | null>> = {
  local: null,
  pending: 'Enviando para o GitHub',
  sending: 'Enviando para o GitHub',
  sent: 'Publicado no GitHub',
  failed: 'Ainda não chegou ao GitHub',
  cancelled: null,
};

export const VOTE_NOTE = 'Os votos mostram interesse. A decisão também considera os relatos e o impacto.';

export const PULL_REQUEST_STATE_LABEL: Readonly<Record<PullRequestReference['state'], string>> = {
  open: 'aberto',
  closed: 'fechado',
  merged: 'incorporado',
};

export const DRAFT_STORAGE_PREFIX = 'community:draft:';
export const DISPLAY_NAME_STORAGE_KEY = 'community:display-name';
