'use client';

import PDFViewer from '@/components/pdf-viewer';
import { useState } from 'react';
import { PdfDisplayOptions } from './pdf-display-options';
import type { PdfDisplayMode } from './pdf-display-options-types';
import type { PdfReadingLayoutProps } from './pdf-reading-layout-types';
import { ZineReadingLayout } from './zine-reading-layout';

export function PdfReadingLayout({ sidebar, sidebarHeader, url }: PdfReadingLayoutProps) {
  const [displayMode, setDisplayMode] = useState<PdfDisplayMode>('full');

  return (
    <ZineReadingLayout
      sidebarHeader={sidebarHeader}
      sidebar={(
        <div className="space-y-6">
          {sidebar}
          <PdfDisplayOptions onChange={setDisplayMode} value={displayMode} />
        </div>
      )}
    >
      <div className="h-[min(72vh,56rem)] min-h-[32rem] w-full overflow-hidden border border-neutral-200 bg-white lg:h-full">
        <PDFViewer fitToPage={displayMode === 'fit'} url={url} />
      </div>
    </ZineReadingLayout>
  );
}
