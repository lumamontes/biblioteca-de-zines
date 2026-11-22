import type { ProposalDetailView } from '@/application/community-view.types';
import { formatDateTime } from './proposal-formatting.helpers';
import { PULL_REQUEST_STATE_LABEL } from './proposal-text.config';

export function TechnicalDetails({ proposal }: { proposal: ProposalDetailView }) {
  const { principalIssue, relatedTasks, pullRequests, syncedAt } = proposal;
  if (!principalIssue) return null;
  return (
    <details className="disclosure section">
      <summary>Detalhes técnicos</summary>
      <dl>
        <dt>Issue</dt>
        <dd><a href={principalIssue.url}>#{principalIssue.number} {principalIssue.technicalTitle}</a></dd>
        {relatedTasks.length > 0 ? <dt>Tarefas relacionadas</dt> : null}
        {relatedTasks.map((task) => (
          <dd key={task.number}><a href={task.url}>#{task.number} {task.title}</a></dd>
        ))}
        {pullRequests.length > 0 ? <dt>Pull requests</dt> : null}
        {pullRequests.map((pr) => (
          <dd key={pr.number}><a href={pr.url}>#{pr.number} {pr.title}</a> ({PULL_REQUEST_STATE_LABEL[pr.state]})</dd>
        ))}
        {syncedAt ? (
          <>
            <dt>Atualizado com o GitHub em</dt>
            <dd><time dateTime={syncedAt}>{formatDateTime(syncedAt)}</time></dd>
          </>
        ) : null}
      </dl>
    </details>
  );
}
