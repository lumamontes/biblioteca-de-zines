export type PageKind = 'cover' | 'interior' | 'back-cover';

export type Page = {
  index: number;
  kind: PageKind;
  width: number;
  height: number;
};

export type Spread = {
  pages: Page[];
};

export function classifyPage(index: number, pageCount: number): PageKind {
  if (index === 0) return 'cover';
  if (index === pageCount - 1) return 'back-cover';
  return 'interior';
}

export function buildSpreads(pages: Page[], wideViewport: boolean): Spread[] {
  if (!wideViewport || pages.length < 2) {
    return pages.map((page) => ({ pages: [page] }));
  }

  const spreads: Spread[] = [];
  const firstPage = pages[0];
  const lastPage = pages.at(-1);

  if (firstPage) spreads.push({ pages: [firstPage] });

  const interiorPages = pages.slice(1, -1);
  for (let index = 0; index < interiorPages.length; index += 2) {
    const left = interiorPages[index];
    const right = interiorPages[index + 1];
    spreads.push({ pages: right ? [left, right] : [left] });
  }

  if (lastPage && lastPage !== firstPage) spreads.push({ pages: [lastPage] });

  return spreads;
}

export function createPages(
  pageCount: number,
  dimensions: Array<Pick<Page, 'width' | 'height'>> = [],
): Page[] {
  return Array.from({ length: pageCount }, (_, index) => ({
    index,
    kind: classifyPage(index, pageCount),
    width: dimensions[index]?.width ?? 1,
    height: dimensions[index]?.height ?? 1,
  }));
}
