import type { InfluenceKind, Stage } from './proposal.types';

export const STAGE_LABEL_PREFIX = 'portal:';

/** Non-stage label: the team wants community input on this proposal first. */
export const FEATURED_LABEL = 'portal:featured';

export const STAGE_BY_GITHUB_LABEL: Readonly<Record<string, Stage>> = {
  'portal:discussion': 'discussion',
  'portal:decided': 'decided',
  'portal:in-progress': 'in_progress',
  'portal:not-planned': 'not_planned',
};

/** Higher means further along. Used when several stage labels are present. */
export const STAGE_PROGRESS: Readonly<Record<Stage, number>> = {
  triage: 0,
  archived: 0,
  discussion: 1,
  decided: 2,
  in_progress: 3,
  not_planned: 4,
  available: 5,
};

export const TERMINAL_STAGES: ReadonlySet<Stage> = new Set<Stage>(['available', 'not_planned', 'archived']);

export const STAGE_TEXT: Readonly<Record<Stage, { label: string; description: string }>> = {
  triage: { label: 'Recebida, em triagem', description: 'A equipe ainda vai ler e ligar esta sugestão a uma issue.' },
  discussion: { label: 'Em conversa', description: 'A decisão está aberta. Sua contribuição pode mudar o rumo.' },
  decided: { label: 'Decidida: vamos fazer', description: 'A equipe decidiu seguir com esta proposta.' },
  in_progress: { label: 'Em desenvolvimento', description: 'A melhoria está sendo construída.' },
  available: { label: 'Disponível na Biblioteca', description: 'A melhoria já está no ar para todo mundo.' },
  not_planned: { label: 'Não vamos seguir agora', description: 'A equipe explicou por que não vai seguir com esta proposta agora.' },
  archived: { label: 'Arquivada', description: 'A sugestão foi encerrada na triagem, com justificativa.' },
};

export const INFLUENCE_TEXT: Readonly<Record<InfluenceKind, string>> = {
  clarified_need: 'esclareceu uma necessidade',
  changed_priority: 'alterou uma prioridade',
  changed_solution: 'mudou a solução',
};
