import type { OfficialResponse } from '@/domain/proposal.types';
import { formatDate, paragraphs } from './proposal-formatting.helpers';
import { RESPONSE_KIND_LABEL } from './proposal-text.config';

type OfficialResponseBlockProps = { response: OfficialResponse; text?: string; color?: 'blue' | 'green'; children?: React.ReactNode };

/** The team's answers are notes too, so they stand apart from the comments. */
export function OfficialResponseBlock({ response, text, color = 'blue', children }: OfficialResponseBlockProps) {
  return (
    <article className={`note note--${color} note--wide`}>
      <p className="note__byline">
        <span className="visually-hidden">{RESPONSE_KIND_LABEL[response.kind]}: </span>
        {response.authorLogin} · <time dateTime={response.createdAt}>{formatDate(response.createdAt)}</time>
      </p>
      {paragraphs(text ?? response.body).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {children}
      <a href={response.url} className="note__link">ver no GitHub</a>
    </article>
  );
}
