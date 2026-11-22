import type { ProposalDetailView } from '@/application/participation-view.types';
import { formatDateTime } from './proposal-formatting.helpers';
import { PULL_REQUEST_STATE_LABEL } from './proposal-text.config';

export function TechnicalDetails({ proposal }: { proposal: ProposalDetailView }) {
  const { principalIssue, relatedTasks, pullRequests, syncedAt } = proposal;
  return (
    <details className="panel technical">
      <summary>Detalhes técnicos</summary>
      {principalIssue ? (
        <dl className="technical__list">
          <dt>Issue principal</dt>
          <dd>
            <a href={principalIssue.url} className="external">#{principalIssue.number} {principalIssue.technicalTitle}</a>
          </dd>
          {relatedTasks.length > 0 ? (
            <>
              <dt>Tarefas relacionadas</dt>
              {relatedTasks.map((task) => (
                <dd key={task.number}>
                  <a href={task.url} className="external">#{task.number} {task.title}</a>
                </dd>
              ))}
            </>
          ) : null}
          {pullRequests.length > 0 ? (
            <>
              <dt>Pull requests</dt>
              {pullRequests.map((pr) => (
                <dd key={pr.number}>
                  <a href={pr.url} className="external">#{pr.number} {pr.title}</a> ({PULL_REQUEST_STATE_LABEL[pr.state]})
                </dd>
              ))}
            </>
          ) : null}
          {syncedAt ? (
            <>
              <dt>Última sincronização com o GitHub</dt>
              <dd><time dateTime={syncedAt}>{formatDateTime(syncedAt)}</time></dd>
            </>
          ) : null}
        </dl>
      ) : (
        <p>Esta sugestão ainda não foi ligada a uma issue do GitHub.</p>
      )}
    </details>
  );
}
