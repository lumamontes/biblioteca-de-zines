'use client';

import PDFViewer from '@/components/pdf-viewer';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { EmbedCustomizer } from './embed-customizer';
import { ReaderModeTabs } from './reader-mode-tabs';
import { useEmbedPreview } from './use-embed-preview';
import type { ReaderDisplayMode, ZineReaderOptionsProps } from './zine-reader-options-types';
import { ZineReaderToolbar } from './zine-reader-toolbar';

export function ZineReaderOptions({ initialMode, surface }: ZineReaderOptionsProps) {
  const [mode, setMode] = useState<ReaderDisplayMode>(initialMode);
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const readerFrameRef = useRef<HTMLIFrameElement>(null);
  const { configuration, copyStatus, copyEmbedCode, embedCode, previewUrl, updateConfiguration } = useEmbedPreview(surface.beta.embedUrl, surface.title);
  const readerFrame = <iframe allow="fullscreen" allowFullScreen className="h-full w-full border-0" ref={readerFrameRef} src={surface.beta.embedUrl} title={`Leitura digital de ${surface.title}`} />;

  function openFullscreen() {
    const frame = readerFrameRef.current;
    if (!frame?.requestFullscreen) {
      setExpanded(true);
      return;
    }

    void frame.requestFullscreen().catch(() => setExpanded(true));
  }

  function changeMode(nextMode: ReaderDisplayMode) {
    setMode(nextMode);
    const query = new URLSearchParams(window.location.search);
    query.set('view', nextMode === 'beta' ? 'reader' : 'pdf');
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  }

  return (
    <section className="w-full max-w-4xl">
      <div className="mx-auto w-full max-w-xl">
        <ReaderModeTabs pageCount={surface.beta.pageCount} value={mode} onChange={changeMode} />
      </div>
      <div className="min-h-12" />

      <div className="mt-3 flex h-screen min-h-0 flex-col overflow-hidden" role="tabpanel">
        {mode === 'pdf' ? <div className="mx-auto h-full min-h-0 w-full max-w-xl"><PDFViewer url={surface.pdfUrl} /></div> : (
          <div className="flex min-h-0 flex-1 flex-col">
            <ZineReaderToolbar
              originalUrl={surface.pdfUrl}
              embedCustomizer={<EmbedCustomizer configuration={configuration} copyStatus={copyStatus} embedCode={embedCode} onCopy={copyEmbedCode} onUpdate={updateConfiguration} previewUrl={previewUrl.toString()} title={surface.title} triggerClassName="hidden sm:inline-flex" />}
              mobileEmbedCustomizer={<EmbedCustomizer configuration={configuration} copyStatus={copyStatus} embedCode={embedCode} onCopy={copyEmbedCode} onUpdate={updateConfiguration} previewUrl={previewUrl.toString()} title={surface.title} triggerClassName="h-11 w-full justify-start" />}
              onFullscreen={openFullscreen}
            />
            {!expanded && <div className="min-h-0 flex-1 overflow-hidden border border-neutral-200 bg-white">{readerFrame}</div>}
            {expanded && createPortal(
              <div className="fixed inset-0 z-50 bg-white p-3 md:p-6">
                <div className="flex h-full flex-col">
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                    <p className="text-sm font-semibold">Leitura digital</p>
                    <button className="border border-black px-3 py-2 text-xs font-semibold hover:bg-neutral-100" onClick={() => setExpanded(false)} type="button">Fechar tela cheia</button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden border border-neutral-200 bg-white">{readerFrame}</div>
                </div>
              </div>,
              document.body,
            )}
          </div>
        )}
      </div>
    </section>
  );
}
