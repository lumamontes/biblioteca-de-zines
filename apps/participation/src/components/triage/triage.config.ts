import type { GitHubComment } from '@/application/participation.types';
import type { InfluenceKind, StageWarning } from '@/domain/proposal.types';

export const FLASH_COOKIE = 'participation_triage_flash';

export const INFLUENCE_KINDS: readonly InfluenceKind[] = ['clarified_need', 'changed_priority', 'changed_solution'];

export const WARNING_TEXT: Readonly<Record<StageWarning, string>> = {
  terminal_label_on_open_issue: 'A issue está aberta, mas tem um rótulo de etapa final. O portal mostra “Em conversa” até a issue ser fechada.',
  multiple_stage_labels: 'A issue tem mais de um rótulo de etapa. O portal usa o mais avançado.',
  decision_without_justification: 'A etapa indica uma decisão, mas falta um comentário “### Decisão da Biblioteca” com a justificativa.',
  unauthorized_official_marker: 'Alguém que não é mantenedora usou o marcador de resposta oficial. O comentário foi ignorado.',
};

export const SIMULATED_HEADINGS = {
  answer: '### Resposta da Biblioteca',
  update: '### Atualização da Biblioteca',
  decision: '### Decisão da Biblioteca',
} as const;

export const SIMULATED_AUTHORS: readonly { login: string; association: GitHubComment['authorAssociation']; label: string }[] = [
  { login: 'lumamontes', association: 'OWNER', label: 'lumamontes (mantenedora)' },
  { login: 'visitante-qualquer', association: 'NONE', label: 'visitante-qualquer (não é mantenedora)' },
];

export const STAGE_LABEL_OPTIONS: readonly { value: string; label: string }[] = [
  { value: '', label: 'Sem rótulo de etapa' },
  { value: 'portal:discussion', label: 'portal:discussion' },
  { value: 'portal:decided', label: 'portal:decided' },
  { value: 'portal:in-progress', label: 'portal:in-progress' },
  { value: 'portal:not-planned', label: 'portal:not-planned' },
];

export const SIMULATED_ISSUE_OPERATIONS: readonly { operation: string; label: string }[] = [
  { operation: 'close-completed', label: 'Fechar como concluída' },
  { operation: 'close-not-planned', label: 'Fechar como não planejada' },
  { operation: 'reopen', label: 'Reabrir' },
  { operation: 'release', label: 'Confirmar deploy de produção' },
];
