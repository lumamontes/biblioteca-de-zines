import type { ContributionView } from '@/application/participation-view.types';
import { INFLUENCE_TEXT } from '@/domain/stage.config';
import { formatDate, paragraphs } from './proposal-formatting.helpers';
import { DELIVERY_LABEL } from './proposal-text.config';

export function ContributionList({ contributions }: { contributions: ContributionView[] }) {
  if (contributions.length === 0) {
    return <p className="empty">Ninguém comentou ainda. A primeira contribuição costuma ajudar a equipe a entender a necessidade.</p>;
  }
  return (
    <ol className="conversation">
      {contributions.map((contribution) => (
        <li key={contribution.id} id={`contribution-${contribution.id}`} className="contribution">
          {contribution.hidden ? (
            <p className="contribution__removed">Contribuição removida pela moderação.</p>
          ) : (
            <>
              <p className="contribution__byline">
                <strong className="contribution__author">{contribution.displayName}</strong>
                <span aria-hidden="true"> · </span>
                <time dateTime={contribution.createdAt}>{formatDate(contribution.createdAt)}</time>
              </p>
              <div className="prose">
                {paragraphs(contribution.text ?? '').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <p className="contribution__delivery">
                {contribution.delivery === 'sent' && contribution.githubUrl ? (
                  <a href={contribution.githubUrl} className="external">{DELIVERY_LABEL.sent}</a>
                ) : (
                  DELIVERY_LABEL[contribution.delivery]
                )}
              </p>
              {contribution.influence ? (
                <p className="influence">
                  <strong>Ajudou a decidir:</strong> {INFLUENCE_TEXT[contribution.influence.kind]}.
                  {contribution.influence.note ? <> {contribution.influence.note}</> : null}
                </p>
              ) : null}
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
