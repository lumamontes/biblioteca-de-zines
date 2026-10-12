'use client';

import { useEffect, useState } from 'react';
import { getPreviewUrl } from '@/utils/assets';
import type { PublicReaderFallbackReason, PublicReaderResult } from '@/application/reader';
import PDFViewer from '@/components/pdf-viewer';

type PublicReaderProps = {
  reader: PublicReaderResult;
};

const FALLBACK_MESSAGES: Record<PublicReaderFallbackReason | 'reader-failure' | 'user-selected', string> = {
  'incomplete-page-generation': 'A leitura em páginas ainda não está completa. Abra o PDF original enquanto ela é recuperada.',
  'page-generation-failed': 'A leitura em páginas está temporariamente indisponível. O PDF original continua disponível.',
  'page-generation-unavailable': 'A leitura em páginas ainda não está disponível. Abra o PDF original para continuar.',
  'reader-failure': 'A leitura em páginas não pôde ser carregada. Abra o PDF original para continuar.',
  'source-unavailable': 'O PDF original desta publicação não está disponível para leitura.',
  'user-selected': 'Abra o PDF original para continuar a leitura.',
};

export function PublicReader({ reader }: PublicReaderProps) {
  const [state, setState] = useState<PublicReaderResult>(reader);

  useEffect(() => {
    setState(reader);
  }, [reader]);

  if (state.status === 'fallback') return <FallbackView fallback={state.fallback} reason={state.reason} />;
  if (reader.status === 'fallback') return <FallbackView fallback={reader.fallback} reason={reader.reason} />;

  return (
    <section
      aria-label={`Leitor de ${reader.status === 'ready' ? reader.publication.title : 'publicação'}`}
      className="w-full space-y-4"
      data-reader-generation={state.manifest.generationId}
      data-reader-state="ready"
    >
      <div className="flex min-h-[60vh] items-center justify-center bg-neutral-100 p-4">
        {/* Page derivatives may come from the configured custom asset domain. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`Página 1 de ${state.manifest.pageCount}`}
          className="max-h-[70vh] max-w-full object-contain"
          height={state.manifest.pages[0].height}
          onError={() => setState({
            fallback: state.fallback,
            reason: 'reader-failure',
            status: 'fallback',
          })}
          src={state.manifest.pages[0].imageUrl}
          width={state.manifest.pages[0].width}
        />
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span>{state.manifest.pageCount} páginas disponíveis</span>
        <a className="underline" href={reader.fallback.url} target="_blank" rel="noreferrer">
          Abrir o PDF original
        </a>
      </div>
    </section>
  );
}

function FallbackView({
  fallback,
  reason,
}: {
  fallback: { label: string; url: string };
  reason: PublicReaderFallbackReason | 'reader-failure' | 'user-selected';
}) {
  return (
    <section aria-live="polite" className="w-full space-y-4" data-reader-state="fallback">
      <p className="border border-black bg-white p-4 text-sm">{FALLBACK_MESSAGES[reason]}</p>
      {fallback.url ? <PDFViewer url={getPreviewUrl(fallback.url)} /> : (
        <p className="text-sm">O PDF original não está disponível.</p>
      )}
      {fallback.url && (
        <a className="underline" href={fallback.url} target="_blank" rel="noreferrer">
          {fallback.label}
        </a>
      )}
    </section>
  );
}
