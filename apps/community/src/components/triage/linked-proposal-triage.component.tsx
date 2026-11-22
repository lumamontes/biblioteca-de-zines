import Link from 'next/link';
import type { TriageProposalView } from '@/application/community-view.types';
import { INFLUENCE_TEXT, STAGE_LABEL } from '@/domain/stage.config';
import { DELIVERY_LABEL } from '@/components/proposal/proposal-text.config';
import type { TriageActions } from './triage-actions.types';
import { INFLUENCE_KINDS, SIMULATED_AUTHORS, SIMULATED_ISSUE_OPERATIONS, STAGE_LABEL_OPTIONS, WARNING_TEXT } from './triage.config';

export function LinkedProposalTriage({ item, actions }: { item: TriageProposalView; actions: TriageActions }) {
  const { summary, principalIssue } = item;
  if (!principalIssue) return null;
  const titleId = `linked-${summary.number}`;
  const visible = item.contributions.filter((contribution) => !contribution.hidden);

  return (
    <article className="row stack-sm" aria-labelledby={titleId}>
      <h3 id={titleId}>
        <Link href={summary.path}>Nº {summary.number} · {summary.title}</Link>
      </h3>
      <p className="muted">
        {STAGE_LABEL[summary.stage]} · issue principal <a href={principalIssue.url} className="link">#{principalIssue.number}</a>
      </p>
      {item.warnings.map((warning) => <p key={warning} className="warning">{WARNING_TEXT[warning]}</p>)}
      <p>
        <a href={principalIssue.url} className="button">Responder na issue #{principalIssue.number}</a>
      </p>

      <form action={actions.relatedTask} className="inline-form">
        <input type="hidden" name="proposalNumber" value={summary.number} />
        <div className="field">
          <label htmlFor={`task-${summary.number}`}>Associar tarefa relacionada (número da issue)</label>
          <input id={`task-${summary.number}`} name="issueNumber" inputMode="numeric" required />
        </div>
        <button type="submit" className="button button--quiet">Associar</button>
      </form>

      {visible.length > 0 ? (
        <details className="disclosure">
          <summary>Moderar e registrar influência ({visible.length})</summary>
          <ul className="rows">
            {visible.map((contribution) => (
              <li key={contribution.id} className="entry stack-sm">
                <p><strong>{contribution.displayName}</strong>: {contribution.text}</p>
                <p className="muted">{DELIVERY_LABEL[contribution.delivery] ?? 'No portal'}{contribution.influence ? ` · ajudou a decidir: ${INFLUENCE_TEXT[contribution.influence.kind]}` : ''}</p>
                <form action={actions.influence} className="inline-form">
                  <input type="hidden" name="contributionId" value={contribution.id} />
                  <div className="field">
                    <label htmlFor={`kind-${contribution.id}`}>Esta contribuição…</label>
                    <select id={`kind-${contribution.id}`} name="kind">
                      {INFLUENCE_KINDS.map((kind) => <option key={kind} value={kind}>{INFLUENCE_TEXT[kind]}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`note-${contribution.id}`}>Nota pública (opcional)</label>
                    <input id={`note-${contribution.id}`} name="note" maxLength={300} />
                  </div>
                  <button type="submit" className="button button--quiet">Registrar influência</button>
                </form>
                <form action={actions.moderate} className="inline-form">
                  <input type="hidden" name="contributionId" value={contribution.id} />
                  <div className="field">
                    <label htmlFor={`mod-${contribution.id}`}>Motivo da moderação (interno)</label>
                    <input id={`mod-${contribution.id}`} name="reason" maxLength={300} />
                  </div>
                  <button type="submit" className="button button--quiet">Ocultar</button>
                </form>
                {contribution.githubCommentId ? (
                  <form action={actions.simulate}>
                    <input type="hidden" name="proposalNumber" value={summary.number} />
                    <input type="hidden" name="issueNumber" value={principalIssue.number} />
                    <input type="hidden" name="operation" value="delete-comment" />
                    <input type="hidden" name="commentId" value={contribution.githubCommentId} />
                    <button type="submit" className="button button--quiet">Simular: apagar o comentário no GitHub</button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <details className="disclosure">
        <summary>Simular ações no GitHub (só no ambiente local)</summary>
        <form action={actions.simulate} className="contribute">
          <input type="hidden" name="proposalNumber" value={summary.number} />
          <input type="hidden" name="issueNumber" value={principalIssue.number} />
          <input type="hidden" name="operation" value="comment" />
          <div className="field">
            <label htmlFor={`sim-kind-${summary.number}`}>Tipo de comentário</label>
            <select id={`sim-kind-${summary.number}`} name="kind">
              <option value="answer">### Resposta da Biblioteca de Zines</option>
              <option value="update">### Atualização da Biblioteca de Zines</option>
              <option value="decision">### Decisão da Biblioteca de Zines</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor={`sim-author-${summary.number}`}>Autoria</label>
            <select id={`sim-author-${summary.number}`} name="author">
              {SIMULATED_AUTHORS.map((author) => <option key={author.login} value={author.login}>{author.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`sim-body-${summary.number}`}>Texto</label>
            <textarea id={`sim-body-${summary.number}`} name="body" rows={4} required />
          </div>
          <button type="submit" className="button button--quiet">Comentar na issue</button>
        </form>
        <form action={actions.simulate} className="inline-form">
          <input type="hidden" name="proposalNumber" value={summary.number} />
          <input type="hidden" name="issueNumber" value={principalIssue.number} />
          <input type="hidden" name="operation" value="label" />
          <div className="field">
            <label htmlFor={`sim-label-${summary.number}`}>Rótulo de etapa</label>
            <select id={`sim-label-${summary.number}`} name="label">
              {STAGE_LABEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <button type="submit" className="button button--quiet">Aplicar rótulo</button>
        </form>
        <div className="inline-form">
          {SIMULATED_ISSUE_OPERATIONS.map(({ operation, label }) => (
            <form key={operation} action={actions.simulate}>
              <input type="hidden" name="proposalNumber" value={summary.number} />
              <input type="hidden" name="issueNumber" value={principalIssue.number} />
              <input type="hidden" name="operation" value={operation} />
              <button type="submit" className="button button--quiet">{label}</button>
            </form>
          ))}
        </div>
      </details>
    </article>
  );
}
