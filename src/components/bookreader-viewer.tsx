'use client';

import { useEffect, useRef, useState } from 'react';
import type { PublicReaderApiResponse } from '@/application/reader/public-reader-api';
import type { ViewerEventType } from '@/application/reader/viewer-events';
import { createReaderSession } from '@/application/reader/reader-session';
import { createClientBookReaderRenderer } from '@/composition/client/bookreader';

type BookReaderViewerProps = {
  apiOrigin?: string;
  branding?: boolean;
  betaToken?: string;
  slug: string;
  surface: 'reader' | 'embed';
};

export function BookReaderViewer({ apiOrigin = '', betaToken, branding = false, slug, surface }: BookReaderViewerProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [reader, setReader] = useState<Extract<PublicReaderApiResponse, { status: 'ready' }>>();
  const [fallback, setFallback] = useState<{ label: string; url: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let disposed = false;
    let destroy = () => {};

    async function mount() {
      let availableFallback: { label: string; url: string } | undefined;
      try {
        const response = await fetch(`${apiOrigin}/api/public-reader/${encodeURIComponent(slug)}?surface=${surface}`, {
          credentials: 'omit',
          headers: betaToken ? { 'X-Reader-Beta-Token': betaToken } : undefined,
        });
        if (!response.ok) throw new Error('Reader data unavailable');
        const data = await response.json() as PublicReaderApiResponse;
        if (data.status !== 'ready') {
          if (!disposed) {
            setFallback(data.fallback);
            setStatus('fallback');
            reportViewerEvent(apiOrigin, { slug, surface, type: 'fallback' });
          }
          return;
        }
        if (disposed) return;
        availableFallback = data.fallback;
        setReader(data);
        setFallback(data.fallback);
        setCurrentPage(data.manifest.pages[0].pageNumber);
        const renderer = await createClientBookReaderRenderer();
        if (disposed || !targetRef.current) {
          renderer.destroy();
          return;
        }

        const session = createReaderSession({
          fallback: data.fallback,
          manifest: data.manifest,
        }, renderer);
        const unsubscribe = session.subscribe((nextState) => {
          if (nextState.status === 'ready') {
            setCurrentPage(nextState.currentPage);
            setStatus('ready');
          } else {
            setStatus('fallback');
          }
        });
        const reportPageFailure = () => {
          reportViewerEvent(apiOrigin, { slug, surface, type: 'page-error' });
          session.useFallback('reader-failure');
        };
        targetRef.current.addEventListener('error', reportPageFailure, true);
        session.mount(targetRef.current);
        destroy = () => {
          targetRef.current?.removeEventListener('error', reportPageFailure, true);
          unsubscribe();
          session.destroy();
        };

        if (session.getState().status === 'fallback') setStatus('fallback');
        else {
          setStatus('ready');
          reportViewerEvent(apiOrigin, { slug, surface, type: 'ready' });
        }
      } catch {
        if (!disposed) {
          setFallback(availableFallback);
          setStatus('fallback');
          reportViewerEvent(apiOrigin, { slug, surface, type: 'fallback' });
        }
      }
    }

    void mount();
    return () => {
      disposed = true;
      destroy();
    };
  }, [apiOrigin, betaToken, slug, surface]);

  if (status === 'fallback') {
    return (
      <FallbackView
        branding={branding}
        fallback={fallback ?? { label: 'Abrir o PDF original', url: '' }}
        title={reader?.publication.title ?? slug}
      />
    );
  }

  return (
    <main className={branding ? 'bookreader-viewer bookreader-viewer--branded' : 'bookreader-viewer'}>
      <div
        aria-label={`Leitor de ${reader?.publication.title ?? slug}`}
        className="BookReaderContainer"
        data-reader-generation={reader?.manifest.generationId}
        data-reader-page={currentPage}
        ref={targetRef}
      />
      <p className="sr-only" role="status">Página {currentPage} de {reader?.manifest.pageCount ?? ''}</p>
    </main>
  );
}

function reportViewerEvent(
  apiOrigin: string,
  event: { slug: string; surface: 'reader' | 'embed'; type: ViewerEventType },
) {
  void fetch(`${apiOrigin}/api/public-reader/events`, {
    body: JSON.stringify(event),
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => {});
}

function FallbackView({
  branding,
  fallback,
  title,
}: {
  branding: boolean;
  fallback: { label: string; url: string };
  title: string;
}) {
  return (
    <main className={branding ? 'bookreader-viewer bookreader-viewer--branded' : 'bookreader-viewer'}>
      <p role="alert">A leitura em páginas não pôde ser carregada.</p>
      {fallback.url ? (
        <a href={fallback.url} rel="noreferrer" target="_blank">
          {fallback.label} - {title}
        </a>
      ) : (
        <p>O PDF original não está disponível.</p>
      )}
    </main>
  );
}
