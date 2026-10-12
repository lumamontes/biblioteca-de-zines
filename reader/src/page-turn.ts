import { PageFlip } from 'page-flip';
import type { ReaderPage, ReaderRenderer, ReaderRendererOptions } from './contract';

type PageTurnSettings = { reducedMotion?: boolean };

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
      element.dataset.loaded = 'true';
      element.append(image);
    } else {
      element.dataset.loaded = 'false';
      const loading = document.createElement('span');
      loading.className = 'reader-page-loading';
      loading.textContent = 'Preparing page...';
      loading.setAttribute('aria-label', `Preparing page ${index + 1}`);
      element.append(loading);
    }
    return element;
  });
}

function replacePageContents(items: HTMLElement[], pages: readonly ReaderPage[]): boolean {
  const pagesByIndex = new Map(pages.map((page) => [page.index, page]));
  let changed = false;
  items.forEach((element) => {
    const page = pagesByIndex.get(Number(element.dataset.pageIndex));
    if (page && element.dataset.loaded !== 'true') {
      element.replaceChildren();
      const image = document.createElement('img');
      image.src = page.url;
      image.alt = page.alt ?? `Publication page ${page.index + 1}`;
      image.draggable = false;
      element.dataset.loaded = 'true';
      element.append(image);
      changed = true;
    }
  });
  return changed;
}

/** PageFlip adapter. The PageFlip instance and its page nodes live for the mount lifetime. */
export function createPageTurnRenderer(settings: PageTurnSettings = {}): ReaderRenderer & { next(): void; previous(): void } {
  let flip: PageFlip | undefined;
  let mount: HTMLDivElement | undefined;
  let onPageChange: ((page: number) => void) | undefined;
  let onRequestPage: ((page: number) => Promise<boolean>) | undefined;
  let pageCount = 0;
  let currentPage = 0;
  let items: HTMLElement[] = [];
  let state = 'read';
  let queuedPages: readonly ReaderPage[] | undefined;
  let controls: HTMLDivElement | undefined;

  const syncInteraction = () => {
    if (!mount) return;
    const previousReady = items[currentPage - 1]?.dataset.loaded === 'true';
    const nextReady = items[currentPage + 1]?.dataset.loaded === 'true';
    mount.style.pointerEvents = previousReady || nextReady ? 'auto' : 'none';
  };

  const updateWhenRead = (pages: readonly ReaderPage[]) => {
    if (!flip || state !== 'read') {
      queuedPages = pages;
      return;
    }
    queuedPages = undefined;
    if (replacePageContents(items, pages)) flip.updateFromHtml(items);
    syncInteraction();
  };

  const requestFlip = (direction: -1 | 1) => {
    if (!flip || state !== 'read') return;
    const target = currentPage + direction;
    if (target < 0 || target >= pageCount) return;
    const start = () => {
      if (direction > 0) {
        flip?.flipNext('bottom');
        return;
      }
      // page-flip 2.0.7 checks flipPrev's hard-coded x=10 point against the
      // viewport, so a centered book is rejected while clicks are disabled.
      const instance = flip as unknown as { setting?: { disableFlipByClick?: boolean } };
      const setting = instance.setting;
      const previous = setting?.disableFlipByClick;
      if (setting) setting.disableFlipByClick = false;
      flip?.flipPrev('top');
      if (setting) setting.disableFlipByClick = previous;
    };
    if (!onRequestPage) {
      if (items[target]?.dataset.loaded === 'true') start();
      return;
    }
    void onRequestPage(target).then((ready) => {
      if (ready && state === 'read' && currentPage + direction === target) start();
    });
  };

  const mountRenderer = (container: HTMLElement, pages: readonly ReaderPage[], options: ReaderRendererOptions) => {
    flip?.destroy();
    mount?.remove();
    mount = document.createElement('div');
    mount.className = 'reader-page-turn-mount';
    container.append(mount);
    onPageChange = options.onPageChange;
    onRequestPage = options.onRequestPage;
    pageCount = options.pageCount;
    currentPage = Math.max(0, Math.min(options.currentPage, pageCount - 1));
    items = pageElements(pageCount, pages);
    flip = new PageFlip(mount, {
      width: 520,
      height: 720,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 520,
      minHeight: 390,
      maxHeight: 720,
      startPage: currentPage,
      showCover: true,
      usePortrait: !options.wideViewport,
      useMouseEvents: true,
      mobileScrollSupport: true,
      swipeDistance: 30,
      disableFlipByClick: true,
      drawShadow: !settings.reducedMotion,
      maxShadowOpacity: settings.reducedMotion ? 0 : 0.35,
      flippingTime: settings.reducedMotion ? 1 : 850,
    });
    flip.on('changeState', (event) => {
      if (typeof event.data === 'string') state = event.data;
      if (state === 'read' && queuedPages) updateWhenRead(queuedPages);
    });
    flip.on('flip', (event) => {
      if (typeof event.data === 'number') {
        currentPage = Math.max(0, Math.min(event.data, pageCount - 1));
        syncInteraction();
        onPageChange?.(currentPage);
      }
    });
    flip.loadFromHTML(items);
    syncInteraction();

    controls = document.createElement('div');
    controls.className = 'reader-page-turn-controls';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'reader-page-turn-zone reader-page-turn-zone--previous';
    previous.setAttribute('aria-label', 'Previous page');
    previous.textContent = '<';
    previous.addEventListener('click', () => requestFlip(-1));
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'reader-page-turn-zone reader-page-turn-zone--next';
    next.setAttribute('aria-label', 'Next page');
    next.textContent = '>';
    next.addEventListener('click', () => requestFlip(1));
    controls.append(previous, next);
    container.append(controls);
  };

  return {
    mount: mountRenderer,
    update: (pages, options) => {
      onPageChange = options.onPageChange;
      onRequestPage = options.onRequestPage;
      if (!flip || options.pageCount !== pageCount) return;
      updateWhenRead(pages);
    },
    next: () => requestFlip(1),
    previous: () => requestFlip(-1),
    destroy: () => {
      flip?.destroy();
      flip = undefined;
      mount = undefined;
      controls?.remove();
      controls = undefined;
      onPageChange = undefined;
      onRequestPage = undefined;
      items = [];
      queuedPages = undefined;
      pageCount = 0;
      state = 'read';
    },
  };
}
