import { describe, expect, it } from 'vitest';
import { buildSpreads, classifyPage, createPages } from './page-model';

describe('visual publication page model', () => {
  it('keeps covers as single pages in a wide layout', () => {
    const spreads = buildSpreads(createPages(6), true);

    expect(spreads.map(({ pages }) => pages.map(({ index }) => index))).toEqual([
      [0],
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it('does not pair pages in a narrow layout', () => {
    const spreads = buildSpreads(createPages(4), false);

    expect(spreads).toHaveLength(4);
    expect(spreads.every(({ pages }) => pages.length === 1)).toBe(true);
  });

  it('keeps an odd interior page readable without inventing content', () => {
    const spreads = buildSpreads(createPages(5), true);

    expect(spreads.map(({ pages }) => pages.map(({ index }) => index))).toEqual([
      [0],
      [1, 2],
      [3],
      [4],
    ]);
  });

  it('classifies publication boundaries', () => {
    expect(classifyPage(0, 3)).toBe('cover');
    expect(classifyPage(1, 3)).toBe('interior');
    expect(classifyPage(2, 3)).toBe('back-cover');
  });
});
