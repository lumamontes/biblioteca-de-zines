'use client';

import PDFViewer from '@/components/pdf-viewer';
import { useState } from 'react';
import { EmbedCustomizer } from './embed-customizer';
import { ReaderModeTabs } from './reader-mode-tabs';
import { useEmbedPreview } from './use-embed-preview';
import type { AvailableZineReadingSurface, ReaderDisplayMode } from './zine-reader-options-types';

type ZineReaderOptionsProps = {
  surface: AvailableZineReadingSurface;
};

export function ZineReaderOptions({ surface }: ZineReaderOptionsProps) {
  const [mode, setMode] = useState<ReaderDisplayMode>('pdf');
  const { configuration, copyStatus, copyEmbedCode, embedCode, previewUrl, updateConfiguration } = useEmbedPreview(surface.beta.embedUrl, surface.title);

  return (
    <section className="w-full max-w-xl">
      <ReaderModeTabs pageCount={surface.beta.pageCount} value={mode} onChange={setMode} />
      <EmbedCustomizer configuration={configuration} copyStatus={copyStatus} embedCode={embedCode} onCopy={copyEmbedCode} onUpdate={updateConfiguration} />

      <div className="mt-3 h-screen overflow-hidden" role="tabpanel">
        {mode === 'pdf' ? <PDFViewer url={surface.pdfUrl} /> : <iframe allow="fullscreen" allowFullScreen className="h-full w-full" src={previewUrl.toString()} title={`Leitor beta de ${surface.title}`} />}
      </div>
    </section>
  );
}
