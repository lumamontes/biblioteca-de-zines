import type { OfficialResponse } from '@/domain/proposal.types';
import { formatDate, paragraphs } from './proposal-formatting.helpers';
import { RESPONSE_KIND_LABEL } from './proposal-text.config';

type OfficialResponseBlockProps = { response: OfficialResponse; text?: string; children?: React.ReactNode };

export function OfficialResponseBlock({ response, text, children }: OfficialResponseBlockProps) {
  const edited = response.updatedAt !== response.createdAt;
  return (
    <article className={`official official--${response.kind}`}>
      <p className="official__label">{RESPONSE_KIND_LABEL[response.kind]}</p>
      <p className="official__byline">
        Por <strong>{response.authorLogin}</strong>, em <time dateTime={response.createdAt}>{formatDate(response.createdAt)}</time>
        {edited ? <> · editada em <time dateTime={response.updatedAt}>{formatDate(response.updatedAt)}</time></> : null}
      </p>
      <div className="prose">
        {paragraphs(text ?? response.body).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {children}
      <p>
        <a href={response.url} className="external">Ver no GitHub</a>
      </p>
    </article>
  );
}
