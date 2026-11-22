import { STAGE_TEXT } from '@/domain/stage.config';
import type { Stage } from '@/domain/proposal.types';

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`stage stage--${stage}`}>
      <span className="visually-hidden">Etapa: </span>
      {STAGE_TEXT[stage].label}
    </span>
  );
}
