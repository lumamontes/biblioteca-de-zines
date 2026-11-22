import type { DeliveryState, OfficialResponseKind, PullRequestReference } from '@/domain/proposal.types';

export const RESPONSE_KIND_LABEL: Readonly<Record<OfficialResponseKind, string>> = {
  answer: 'Resposta oficial da Biblioteca',
  update: 'Atualização oficial da Biblioteca',
  decision: 'Decisão da Biblioteca',
};

export const DELIVERY_LABEL: Readonly<Record<DeliveryState, string>> = {
  local: 'Publicado neste portal',
  pending: 'Aguardando publicação no GitHub',
  sending: 'Enviando para o GitHub',
  sent: 'Publicado no GitHub',
  failed: 'Publicação no GitHub pendente',
  cancelled: 'Não publicado',
};

export const VOTE_NOTE = 'Os votos ajudam a equipe a perceber interesse. Eles não decidem sozinhos: relatos e impacto também contam.';

export const DRAFT_STORAGE_PREFIX = 'participation:draft:';
export const DISPLAY_NAME_STORAGE_KEY = 'participation:display-name';

export const PULL_REQUEST_STATE_LABEL: Readonly<Record<PullRequestReference['state'], string>> = {
  open: 'aberto',
  closed: 'fechado',
  merged: 'incorporado',
};
