import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReaderPage } from './contract';

const pageFlipMock = vi.hoisted(() => vi.fn());

vi.mock('page-flip', () => ({ PageFlip: pageFlipMock }));

class FakeElement {
  className = '';
  dataset: Record<string, string> = {};
  children: FakeElement[] = [];
  textContent = '';

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
  beforeEach(() => {
    pageFlipMock.mockReset();
    pageFlipMock.mockImplementation(() => ({
      destroy: vi.fn(),
      getCurrentPageIndex: vi.fn(() => 0),
      loadFromHTML: vi.fn(),
      on: vi.fn(),
      turnToPage: vi.fn(),
      updateFromHtml: vi.fn(),
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
    const instance = pageFlipMock.mock.results[0]?.value;
    expect(instance.updateFromHtml).toHaveBeenCalledOnce();
    expect(instance.destroy).not.toHaveBeenCalled();

    renderer.destroy();
    expect(instance.destroy).toHaveBeenCalledOnce();
  });
});
