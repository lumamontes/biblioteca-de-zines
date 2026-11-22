import Link from 'next/link';
import type { TriageProposalView } from '@/application/community-view.types';
import { voteSummary } from '@/components/proposal/proposal-formatting.helpers';
import type { TriageActions } from './triage-actions.types';

export function SuggestionTriage({ item, actions }: { item: TriageProposalView; actions: TriageActions }) {
  const { summary } = item;
  const titleId = `triage-${summary.number}`;
  return (
    <article className="triage-item" aria-labelledby={titleId}>
      <h3 id={titleId}>
        <Link href={summary.path}>Nº {summary.number} · {summary.title}</Link>
      </h3>
      <p className="note">{voteSummary(summary.votes.support, summary.votes.oppose)} · {summary.contributionCount} contribuição(ões)</p>
      {item.originalReport ? (
        <blockquote className="callout">
          <p>{item.originalReport.text}</p>
          <p className="note">— {item.originalReport.displayName}</p>
        </blockquote>
      ) : null}

      <form action={actions.link} className="inline-form">
        <input type="hidden" name="proposalNumber" value={summary.number} />
        <input type="hidden" name="mode" value="existing" />
        <div className="field">
          <label htmlFor={`issue-${summary.number}`}>Vincular a uma issue existente (número)</label>
          <input id={`issue-${summary.number}`} name="issueNumber" inputMode="numeric" pattern="#?[0-9]+" placeholder="186" required />
        </div>
        <button type="submit" className="button">Vincular</button>
      </form>

      <form action={actions.link}>
        <input type="hidden" name="proposalNumber" value={summary.number} />
        <input type="hidden" name="mode" value="create" />
        <button type="submit" className="button button--secondary">Criar issue e vincular</button>
      </form>

      <p className="note">Ao vincular, a conversa e os votos continuam neste endereço, e a issue recebe um comentário com o link para a proposta. Repetir a operação não cria outra issue.</p>

      <form action={actions.archive} className="inline-form">
        <input type="hidden" name="proposalNumber" value={summary.number} />
        <div className="field">
          <label htmlFor={`reason-${summary.number}`}>Arquivar com justificativa pública</label>
          <input id={`reason-${summary.number}`} name="reason" required maxLength={1000} />
        </div>
        <button type="submit" className="button button--secondary">Arquivar</button>
      </form>
    </article>
  );
}
