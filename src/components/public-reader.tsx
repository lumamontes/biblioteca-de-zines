'use client';

import { useEffect, useRef, useState } from 'react';
import { getPreviewUrl } from '@/utils/assets';
import { createReaderSession } from '@/application/reader';
import type { ReaderSession, ReaderSessionState } from '@/application/reader';
import type { PublicReaderFallbackReason, PublicReaderResult } from '@/application/reader';
import { createPublicReaderRenderer } from '@/composition/client/create-image-reader-renderer';
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
  const targetRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<ReaderSession | null>(null);
  const [state, setState] = useState<ReaderSessionState>(() => initialState(reader));

  useEffect(() => {
    setState(initialState(reader));
    if (reader.status !== 'ready' || !targetRef.current) return undefined;
    const session = createReaderSession({ fallback: reader.fallback, manifest: reader.manifest }, createPublicReaderRenderer());
    sessionRef.current = session;
    const unsubscribe = session.subscribe(setState);
    session.mount(targetRef.current);
    return () => {
      unsubscribe();
      session.destroy();
      sessionRef.current = null;
    };
  }, [reader]);

  if (state.status === 'fallback') {
    return <FallbackView fallback={state.fallback} reason={state.reason} />;
  }

  return (
    <section
      aria-label={`Leitor de ${reader.status === 'ready' ? reader.publication.title : 'publicação'}`}
      className="w-full space-y-4"
      data-reader-generation={state.manifest.generationId}
      data-reader-state="ready"
    >
      <div className="flex min-h-[60vh] items-center justify-center bg-neutral-100 p-4" ref={targetRef} />
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3">
          <button className="underline" onClick={() => sessionRef.current?.previous()} type="button">
            Página anterior
          </button>
          <span>Página {state.currentPage} de {state.manifest.pageCount}</span>
          <button className="underline" onClick={() => sessionRef.current?.next()} type="button">
            Próxima página
          </button>
        </div>
        <a className="underline" href={reader.fallback.url} target="_blank" rel="noreferrer">
          Abrir o PDF original
        </a>
      </div>
    </section>
  );
}

function initialState(reader: PublicReaderResult): ReaderSessionState {
  if (reader.status === 'fallback') {
    return reader;
  }
  return {
    currentPage: reader.manifest.pages[0].pageNumber,
    manifest: reader.manifest,
    status: 'ready',
  };
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
