import type { ReaderPageManifest } from '@biblioteca-de-zines/reader-contracts';
import type { ReaderViewMode } from '@/application/reader-types';

export type ReaderViewOptions = { mode?: ReaderViewMode; page?: number };
export type BookReaderOptions = {
  data: Array<Array<{ pageNum: number; uri: string; width: number; height: number }>>;
  defaults: string;
  enablePageResume: false;
  el: string;
  showLogo: false;
  showToolbar: true;
  ui: 'responsive';
};

export function createBookReaderOptions(targetId: string, manifest: ReaderPageManifest, viewOptions: ReaderViewOptions): BookReaderOptions {
  const mode = viewOptions.mode ?? '2up';
  const page = Math.max(1, viewOptions.page ?? 1);
  return {
    data: manifest.pages.map((item) => [{ pageNum: item.pageNumber, uri: item.imageUrl, width: item.width, height: item.height }]),
    defaults: `page/n${page - 1}/mode/${mode}`,
    enablePageResume: false,
    el: `#${targetId}`,
    showLogo: false,
    showToolbar: true,
    ui: 'responsive',
  };
}
