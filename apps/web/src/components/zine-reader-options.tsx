'use client';

import PDFViewer from '@/components/pdf-viewer';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { EmbedCustomizer } from './embed-customizer';
import { PdfDisplayOptions, ReaderModeTabs } from './reader-mode-tabs';
import { useEmbedPreview } from './use-embed-preview';
import type { PdfDisplayMode, ReaderDisplayMode, ZineReaderOptionsProps } from './zine-reader-options-types';
import { ZineReaderToolbar } from './zine-reader-toolbar';
import { ZineReadingLayout } from './zine-reading-layout';

export function ZineReaderOptions({ initialMode, sidebar, sidebarHeader, surface }: ZineReaderOptionsProps) {
  const [mode, setMode] = useState<ReaderDisplayMode>(initialMode);
  const [pdfDisplayMode, setPdfDisplayMode] = useState<PdfDisplayMode>('full');
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const readerFrameRef = useRef<HTMLIFrameElement>(null);
  const { copyStatus, copyEmbedCode, embedCode, previewUrl } = useEmbedPreview(surface.beta.embedUrl, surface.title);
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
    const isReaderMode = mode === 'beta';
    const nextIsReaderMode = nextMode === 'beta';
    setMode(nextMode);
    if (isReaderMode === nextIsReaderMode) return;

    const query = new URLSearchParams(window.location.search);
    query.set('view', nextIsReaderMode ? 'reader' : 'pdf');
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  }

  return (
    <section className="w-full lg:h-full">
      <ZineReadingLayout sidebarHeader={sidebarHeader} sidebar={<div className="space-y-6">
        {sidebar}
        <section aria-labelledby="reading-mode-heading" className="border-t border-neutral-200 pt-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]" id="reading-mode-heading">Modo de visualização</h3>
          <ReaderModeTabs pageCount={surface.beta.pageCount} value={mode} onChange={changeMode} />
        </section>
        {mode === 'pdf' && <PdfDisplayOptions onChange={setPdfDisplayMode} value={pdfDisplayMode} />}
        {mode === 'beta' && <ZineReaderToolbar
          originalUrl={surface.pdfUrl}
          embedCustomizer={<EmbedCustomizer copyStatus={copyStatus} embedCode={embedCode} onCopy={copyEmbedCode} previewUrl={previewUrl} title={surface.title} triggerClassName="w-full justify-start" />}
          onFullscreen={openFullscreen}
          viewerUrl={surface.beta.viewerUrl}
        />}
      </div>}>
        <div className="flex h-[min(72vh,56rem)] min-h-[32rem] min-w-0 flex-col overflow-hidden lg:h-full" role="tabpanel">
          {mode === 'pdf' ? <div className="h-full min-h-0 w-full overflow-hidden border border-neutral-200 bg-white"><PDFViewer fitToPage={pdfDisplayMode === 'fit'} url={surface.pdfUrl} /></div> : (
            <div className="flex min-h-0 flex-1 flex-col">
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
      </ZineReadingLayout>
    </section>
  );
}
