import type { OfficialResponse } from '@/domain/proposal.types';
import { formatDate, paragraphs } from './proposal-formatting.helpers';
import { RESPONSE_KIND_LABEL } from './proposal-text.config';

type OfficialResponseBlockProps = { response: OfficialResponse; text?: string; children?: React.ReactNode };

/** Official answers use the catalogue's callout, so they stand apart from the conversation. */
export function OfficialResponseBlock({ response, text, children }: OfficialResponseBlockProps) {
  return (
    <article className="callout">
      <p className="eyebrow">
        {RESPONSE_KIND_LABEL[response.kind]} · <time dateTime={response.createdAt}>{formatDate(response.createdAt)}</time>
      </p>
      {paragraphs(text ?? response.body).map((paragraph, index) => (
        <p key={index} className="text">{paragraph}</p>
      ))}
      {children}
      <a href={response.url} className="link">Por {response.authorLogin} no GitHub</a>
    </article>
  );
}
