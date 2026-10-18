import type { ReaderPageManifest } from '@biblioteca-de-zines/reader';
import { normalizeReaderPage, type ReaderViewMode } from '@/application/reader-types';

export type ReaderViewOptions = { mode?: ReaderViewMode; page?: number };
export type BookReaderOptions = {
  data: Array<Array<{ pageNum: number; uri: string; width: number; height: number }>>;
  defaults: string;
  enablePageResume: false;
  el: string;
  imagesBaseURL: string;
  showLogo: false;
  showToolbar: true;
  ui: 'responsive';
};

export function createBookReaderOptions(targetId: string, manifest: ReaderPageManifest, viewOptions: ReaderViewOptions): BookReaderOptions {
  const requestedMode = viewOptions.mode ?? '2up';
  const mode = requestedMode === '2up' && manifest.pages.some((page) => page.width > page.height)
    ? '1up'
    : requestedMode;
  const page = normalizeReaderPage(viewOptions.page ?? 1, manifest.pageCount);
  return {
    data: manifest.pages.map((item) => [{ pageNum: item.pageNumber, uri: item.imageUrl, width: item.width, height: item.height }]),
    defaults: `page/n${page - 1}/mode/${mode}`,
    enablePageResume: false,
    el: `#${targetId}`,
    imagesBaseURL: 'https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@5.0.0-87/BookReader/images/',
    showLogo: false,
    showToolbar: true,
    ui: 'responsive',
  };
}
