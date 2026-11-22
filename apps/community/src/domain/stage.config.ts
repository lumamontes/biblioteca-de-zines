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

export const STAGE_LABEL: Readonly<Record<Stage, string>> = {
  triage: 'Em triagem',
  discussion: 'Em conversa',
  decided: 'Decidida',
  in_progress: 'Em desenvolvimento',
  available: 'Disponível na Biblioteca de Zines',
  not_planned: 'Não vamos seguir agora',
  archived: 'Arquivada',
};

export const INFLUENCE_TEXT: Readonly<Record<InfluenceKind, string>> = {
  clarified_need: 'esclareceu uma necessidade',
  changed_priority: 'alterou uma prioridade',
  changed_solution: 'mudou a solução',
};
