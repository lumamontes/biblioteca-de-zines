import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReaderPage } from './contract';

const pageFlipMock = vi.hoisted(() => vi.fn());

vi.mock('page-flip', () => ({ PageFlip: pageFlipMock }));

class FakeElement {
  className = '';
  style: Record<string, string> = {};
  dataset: Record<string, string> = {};
  children: FakeElement[] = [];
  textContent = '';
  src = '';
  alt = '';
  draggable = true;

  setAttribute() {}
  addEventListener() {}
  replaceChildren(...elements: FakeElement[]) { this.children = elements; }

  append(...elements: FakeElement[]) {
    this.children.push(...elements);
  }

  remove() {}
}

const pages: ReaderPage[] = [
  { index: 0, url: '/one.svg' },
  { index: 1, url: '/two.svg' },
];

describe('page-turn renderer lifecycle', () => {
  let handlers: Record<string, (event: { data: unknown }) => void>;

  beforeEach(() => {
    pageFlipMock.mockReset();
    handlers = {};
    pageFlipMock.mockImplementation(() => ({
      destroy: vi.fn(),
      getCurrentPageIndex: vi.fn(() => 0),
      loadFromHTML: vi.fn(),
      on: vi.fn((event: string, handler: (event: { data: unknown }) => void) => { handlers[event] = handler; }),
      turnToPage: vi.fn(),
      updateFromHtml: vi.fn(),
      flipNext: vi.fn(),
      flipPrev: vi.fn(),
    }));
    vi.stubGlobal('document', { createElement: (tag: string) => new FakeElement() });
  });

  it('updates a mounted PageFlip instance instead of recreating it', async () => {
    const { createPageTurnRenderer } = await import('./page-turn');
    const renderer = createPageTurnRenderer();
    const container = new FakeElement() as unknown as HTMLElement;
    const options = { pageCount: 2, currentPage: 0, wideViewport: true, onPageChange: vi.fn() };

    renderer.mount(container, pages, options);
    renderer.update(pages, { ...options, currentPage: 1 });

    expect(pageFlipMock).toHaveBeenCalledOnce();
    expect(pageFlipMock.mock.calls[0]?.[1]).toMatchObject({ disableFlipByClick: true, useMouseEvents: true });
    expect(pageFlipMock.mock.calls[0]?.[1]).toMatchObject({ startPage: 0 });
    const instance = pageFlipMock.mock.results[0]?.value;
    expect(instance.updateFromHtml).not.toHaveBeenCalled();
    expect(instance.destroy).not.toHaveBeenCalled();

    renderer.destroy();
    expect(instance.destroy).toHaveBeenCalledOnce();
  });

  it('defers page surface updates until PageFlip reports the read state', async () => {
    const { createPageTurnRenderer } = await import('./page-turn');
    const renderer = createPageTurnRenderer();
    const container = new FakeElement() as unknown as HTMLElement;
    const options = { pageCount: 2, currentPage: 0, wideViewport: true, onPageChange: vi.fn() };
    renderer.mount(container, pages.slice(0, 1), options);
    const instance = pageFlipMock.mock.results[0]?.value;
    const page = instance.loadFromHTML.mock.calls[0][0][1] as FakeElement;
    const replaceChildren = vi.spyOn(page, 'replaceChildren');

    handlers.changeState?.({ data: 'flipping' });
    renderer.update(pages, options);
    expect(replaceChildren).not.toHaveBeenCalled();
    expect(instance.updateFromHtml).not.toHaveBeenCalled();

    handlers.changeState?.({ data: 'read' });
    expect(replaceChildren).toHaveBeenCalledOnce();
    expect(instance.updateFromHtml).toHaveBeenCalledOnce();
  });
});
