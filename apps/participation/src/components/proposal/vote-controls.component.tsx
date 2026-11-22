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
    return (
      <section className="panel votes" aria-labelledby="votes-title">
        <h2 id="votes-title" className="panel__title">Votos encerrados</h2>
        <p>{countLabel(support, 'voto a favor', 'votos a favor')} e {countLabel(oppose, 'contra', 'contra')}.</p>
      </section>
    );
  }
  const status =
    viewerVote === 1 ? 'Você apoiou esta proposta. Toque de novo para retirar o voto.' : viewerVote === -1 ? 'Você não apoiou esta proposta. Toque de novo para retirar o voto.' : 'Você ainda não votou.';
  return (
    <section className="panel votes" aria-labelledby="votes-title">
      <h2 id="votes-title" className="panel__title">Seu voto</h2>
      <ProgressiveForm fallbackAction={`${returnPath}/vote`} action={action} className="votes__form">
        <input type="hidden" name="proposalNumber" value={proposalNumber} />
        <button type="submit" name="intent" value="support" className="vote" aria-pressed={viewerVote === 1}>
          <span aria-hidden="true">▲</span> Apoiar
          <span className="vote__count">
            {support}
            <span className="visually-hidden"> {support === 1 ? 'voto a favor' : 'votos a favor'}</span>
          </span>
        </button>
        <button type="submit" name="intent" value="oppose" className="vote" aria-pressed={viewerVote === -1}>
          <span aria-hidden="true">▼</span> Não apoiar
          <span className="vote__count">
            {oppose}
            <span className="visually-hidden"> {oppose === 1 ? 'voto contra' : 'votos contra'}</span>
          </span>
        </button>
      </ProgressiveForm>
      <p className="votes__status" role="status">{status}</p>
      <p className="note">{VOTE_NOTE}</p>
    </section>
  );
}
