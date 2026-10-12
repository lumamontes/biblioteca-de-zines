import type { ReaderPageManifest, ReaderRenderer, ReaderRenderTarget } from '@/application/reader';

export function createImageReaderRenderer(): ReaderRenderer {
  let target: HTMLElement | undefined;
  let manifest: ReaderPageManifest | undefined;
  let currentIndex = 0;
  let onPageChanged: ((pageNumber: number) => void) | undefined;
  let onError: (() => void) | undefined;

  const render = () => {
    if (!target || !manifest) return;
    target.replaceChildren();
    const page = manifest.pages[currentIndex];
    const image = document.createElement('img');
    image.alt = `Página ${page.pageNumber} de ${manifest.pageCount}`;
    image.className = 'max-h-[70vh] max-w-full object-contain';
    image.height = page.height;
    image.src = page.imageUrl;
    image.onerror = () => onError?.();
    image.width = page.width;
    target.append(image);
    onPageChanged?.(page.pageNumber);
  };

  const move = (index: number) => {
    if (!manifest) return;
    currentIndex = Math.max(0, Math.min(index, manifest.pages.length - 1));
    render();
  };

  return {
    mount(nextTarget: ReaderRenderTarget, nextManifest, nextOnPageChanged, nextOnError) {
      if (!(nextTarget instanceof HTMLElement)) throw new Error('Reader target must be an HTML element');
      target = nextTarget;
      manifest = nextManifest;
      onPageChanged = nextOnPageChanged;
      onError = nextOnError;
      currentIndex = 0;
      render();
    },
    next: () => move(currentIndex + 1),
    previous: () => move(currentIndex - 1),
    goTo: (pageNumber) => {
      if (!manifest) return;
      const index = manifest.pages.findIndex((page) => page.pageNumber === pageNumber);
      if (index < 0) throw new Error(`Unknown reader page: ${pageNumber}`);
      move(index);
    },
    destroy() {
      target?.replaceChildren();
      target = undefined;
      manifest = undefined;
      onPageChanged = undefined;
      onError = undefined;
    },
  };
}
