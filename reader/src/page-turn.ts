import { PageFlip } from 'page-flip';
import type { ReaderPage, ReaderRenderer, ReaderRendererOptions } from './contract';

type PageTurnSettings = {
  reducedMotion?: boolean;
};

function pageElements(pageCount: number, pages: readonly ReaderPage[]): HTMLDivElement[] {
  const pagesByIndex = new Map(pages.map((page) => [page.index, page]));
  return Array.from({ length: pageCount }, (_, index) => {
    const page = pagesByIndex.get(index);
    const element = document.createElement('div');
    element.className = 'reader-page';
    element.dataset.pageIndex = String(index);
    element.dataset.density = index === 0 || index === pageCount - 1 ? 'hard' : 'soft';
    if (page) {
      const image = document.createElement('img');
      image.src = page.url;
      image.alt = page.alt ?? `Publication page ${index + 1}`;
      image.draggable = false;
      element.append(image);
    } else {
      element.textContent = `Page ${index + 1}`;
    }
    return element;
  });
}

/** StPageFlip adapter. Its mount is disposable because destroy() removes it. */
export function createPageTurnRenderer(settings: PageTurnSettings = {}): ReaderRenderer {
  let flip: PageFlip | undefined;
  let mount: HTMLDivElement | undefined;
  let onPageChange: ((page: number) => void) | undefined;
  let pageCount = 0;

  const create = (container: HTMLElement, pages: readonly ReaderPage[], options: ReaderRendererOptions) => {
    mount = document.createElement('div');
    mount.className = 'reader-page-turn-mount';
    container.append(mount);
    onPageChange = options.onPageChange;
    pageCount = options.pageCount;
    const items = pageElements(pageCount, pages);
    flip = new PageFlip(mount, {
      width: 520,
      height: 720,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 520,
      minHeight: 390,
      maxHeight: 720,
      showCover: true,
      usePortrait: true,
      useMouseEvents: true,
      mobileScrollSupport: true,
      swipeDistance: 30,
      flippingTime: settings.reducedMotion ? 1 : 850,
    });
    flip.loadFromHTML(items);
    flip.on('flip', (event) => {
      if (typeof event.data === 'number') onPageChange?.(Math.max(0, Math.min(event.data, pageCount - 1)));
    });
    flip.turnToPage(Math.max(0, Math.min(options.currentPage, pageCount - 1)));
  };

  return {
    mount: create,
    update: (pages, options) => {
      onPageChange = options.onPageChange;
      if (!flip || !mount || options.pageCount !== pageCount) return;
      const current = flip.getCurrentPageIndex();
      flip.updateFromHtml(pageElements(pageCount, pages));
      flip.turnToPage(Math.max(0, Math.min(options.currentPage ?? current, pageCount - 1)));
    },
    destroy: () => {
      flip?.destroy();
      flip = undefined;
      mount = undefined;
      onPageChange = undefined;
      pageCount = 0;
    },
  };
}
