import type { Metadata } from 'next';
import Link from 'next/link';
import { DELIVERY_LABEL } from '@/components/proposal/proposal-text.config';
import { LinkedProposalTriage } from '@/components/triage/linked-proposal-triage.component';
import { SuggestionTriage } from '@/components/triage/suggestion-triage.component';
import { getParticipationServer, isTriageEnabled } from '@/composition/server/participation-server.service';
import { reopenArchivedAction, retryDeliveriesAction, syncAllAction } from './actions';
import { TRIAGE_ACTIONS as actions } from './triage-actions.config';
import { readTriageFlash } from './triage-flash.helpers';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Triagem', robots: { index: false, follow: false } };



export default async function TriagePage() {
  if (!(await isTriageEnabled())) {
    return (
      <section className="intro" aria-labelledby="page-title">
        <h1 id="page-title" className="page-title">Triagem</h1>
        <p className="lead">A triagem exige entrada de mantenedoras com o GitHub, prevista para o incremento 3.</p>
        <p>Para testar localmente com o GitHub simulado, defina <code>PARTICIPATION_LOCAL_TRIAGE=1</code>.</p>
      </section>
    );
  }

  const { triage, settings } = await getParticipationServer();
  const view = await triage.overview();
  const flash = await readTriageFlash();

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Equipe</p>
        <h1 id="page-title" className="page-title">Triagem</h1>
        <p className="lead">Você está como <strong>{settings.maintainers[0] ?? 'mantenedora'}</strong>, no ambiente local. Respostas oficiais são escritas no GitHub, nunca aqui.</p>
      </section>

      {flash ? <p role="status" className={`flash${flash.status === 'rejected' ? ' flash--error' : ''}`}>{flash.message}</p> : null}

      <div className="stack">
        <section aria-labelledby="triage-title">
          <h2 id="triage-title" className="section-title">Sugestões em triagem ({view.inTriage.length})</h2>
          {view.inTriage.length === 0 ? <p className="empty">Nenhuma sugestão aguardando triagem.</p> : null}
          <div className="triage-grid triage-grid--two">
            {view.inTriage.map((item) => <SuggestionTriage key={item.summary.number} item={item} actions={actions} />)}
          </div>
        </section>

        <section aria-labelledby="deliveries-title">
          <h2 id="deliveries-title" className="section-title">Envios pendentes ou com falha ({view.deliveryProblems.length})</h2>
          {view.deliveryProblems.length === 0 ? (
            <p className="empty">Todos os comentários chegaram ao GitHub.</p>
          ) : (
            <ul className="triage-grid">
              {view.deliveryProblems.map((problem) => (
                <li key={problem.id} className="panel">
                  <p><Link href={`/proposals/${problem.proposalNumber}`}>Nº {problem.proposalNumber} · {problem.proposalTitle}</Link></p>
                  <p>{problem.displayName}: {problem.text}</p>
                  <p className="note">{DELIVERY_LABEL[problem.delivery]}{problem.lastError ? ` · ${problem.lastError}` : ''}</p>
                </li>
              ))}
            </ul>
          )}
          <form action={retryDeliveriesAction}>
            <button type="submit" className="button button--secondary">Reenviar pendentes sem duplicar</button>
          </form>
        </section>

        {view.archived.length > 0 ? (
          <section aria-labelledby="archived-title">
            <h2 id="archived-title" className="section-title">Arquivadas ({view.archived.length})</h2>
            <ul className="triage-grid">
              {view.archived.map((item) => (
                <li key={item.summary.number} className="panel inline-form">
                  <Link href={item.summary.path}>Nº {item.summary.number} · {item.summary.title}</Link>
                  <form action={reopenArchivedAction}>
                    <input type="hidden" name="proposalNumber" value={item.summary.number} />
                    <button type="submit" className="button button--secondary">Reabrir para triagem</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="linked-title">
          <h2 id="linked-title" className="section-title">Propostas vinculadas ({view.linked.length})</h2>
          <form action={syncAllAction}>
            <button type="submit" className="button button--secondary">Sincronizar tudo com o GitHub</button>
          </form>
          <div className="triage-grid">
            {view.linked.map((item) => <LinkedProposalTriage key={item.summary.number} item={item} actions={actions} />)}
          </div>
        </section>
      </div>
    </>
  );
}
