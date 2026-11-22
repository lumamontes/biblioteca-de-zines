import type { VoteValue } from '@/domain/proposal.types';
import { ProgressiveForm } from './progressive-form.component';
import { countLabel } from './proposal-formatting.helpers';
import { VOTE_NOTE } from './proposal-text.config';

type VoteControlsProps = {
  proposalNumber: number;
  returnPath: string;
  support: number;
  oppose: number;
  viewerVote: VoteValue | null;
  open: boolean;
  action: (formData: FormData) => Promise<void>;
};

/** Works without JavaScript; each button reports its pressed state to assistive technology. */
export function VoteControls({ proposalNumber, returnPath, support, oppose, viewerVote, open, action }: VoteControlsProps) {
  if (!open) {
    return <p className="muted votes">Votação encerrada: {countLabel(support, 'voto a favor', 'votos a favor')} e {countLabel(oppose, 'contra', 'contra')}.</p>;
  }
  return (
    <ProgressiveForm fallbackAction={`${returnPath}/vote`} action={action} className="votes">
      <input type="hidden" name="proposalNumber" value={proposalNumber} />
      <button type="submit" name="intent" value="support" className="vote" aria-pressed={viewerVote === 1}>
        Apoiar <span>{support}</span>
        <span className="visually-hidden">{support === 1 ? 'voto a favor' : 'votos a favor'}</span>
      </button>
      <button type="submit" name="intent" value="oppose" className="vote" aria-pressed={viewerVote === -1}>
        Não apoiar <span>{oppose}</span>
        <span className="visually-hidden">{oppose === 1 ? 'voto contra' : 'votos contra'}</span>
      </button>
      <p className="muted" id="votes-title">{viewerVote ? 'Para retirar seu voto, toque nele de novo. ' : ''}{VOTE_NOTE}</p>
    </ProgressiveForm>
  );
}
