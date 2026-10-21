import { hasBetaReadingSurface } from '@/application/reader/reading-surface';
import { PdfReadingLayout } from './pdf-reading-layout';
import { ZineReaderOptions } from './zine-reader-options';
import { ZineUnavailableReadingSurface } from './zine-unavailable-reading-surface';
import type { ZineReadingSurfaceViewProps } from './zine-reading-surface-view-types';

export function ZineReadingSurfaceView({ initialMode, sidebar, sidebarHeader, surface }: ZineReadingSurfaceViewProps) {
  if (surface.availability === 'unavailable') return <ZineUnavailableReadingSurface sidebar={sidebar} sidebarHeader={sidebarHeader} surface={surface} />;
  if (hasBetaReadingSurface(surface)) return <ZineReaderOptions initialMode={initialMode} sidebar={sidebar} sidebarHeader={sidebarHeader} surface={surface} />;
  return <PdfReadingLayout sidebar={sidebar} sidebarHeader={sidebarHeader} url={surface.pdfUrl} />;
}
