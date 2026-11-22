import type { ContributionView } from '@/application/community-view.types';
import { INFLUENCE_TEXT } from '@/domain/stage.config';
import { formatDate, paragraphs } from './proposal-formatting.helpers';
import { DELIVERY_LABEL } from './proposal-text.config';

export function ContributionList({ contributions }: { contributions: ContributionView[] }) {
  if (contributions.length === 0) return <p className="muted">Ninguém comentou ainda.</p>;
  return (
    <ol className="comments">
      {contributions.map((contribution) => {
        const delivery = DELIVERY_LABEL[contribution.delivery];
        return (
          <li key={contribution.id} id={`contribution-${contribution.id}`} className="comment">
            {contribution.hidden ? (
              <p className="muted">Comentário removido pela moderação.</p>
            ) : (
              <>
                <p className="comment__meta">
                  <strong>{contribution.displayName}</strong> · <time dateTime={contribution.createdAt}>{formatDate(contribution.createdAt)}</time>
                </p>
                {paragraphs(contribution.text ?? '').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {contribution.influence ? <p className="comment__foot">✓ ajudou a decidir: {INFLUENCE_TEXT[contribution.influence.kind]}</p> : null}
                {delivery ? (
                  <p className="comment__foot">
                    {contribution.delivery === 'sent' && contribution.githubUrl ? <a href={contribution.githubUrl}>{delivery}</a> : delivery}
                  </p>
                ) : null}
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
