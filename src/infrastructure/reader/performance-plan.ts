export type PerformanceManifestPage = {
  imageUrl: string;
  pageNumber: number;
};

export type ReaderPerformancePlan = {
  adjacentPageUrls: string[];
  manifestUrl: string;
  firstPageUrl: string;
};

export function createReaderPerformancePlan(
  apiUrl: string,
  pages: readonly PerformanceManifestPage[],
  surface: 'reader' | 'embed' = 'embed',
): ReaderPerformancePlan {
  const orderedPages = [...pages].sort((left, right) => left.pageNumber - right.pageNumber);
  const firstPage = orderedPages[0];
  if (!firstPage) throw new Error('A performance plan requires at least one page');

  return {
    adjacentPageUrls: orderedPages.slice(1, 3).map((page) => page.imageUrl),
    firstPageUrl: firstPage.imageUrl,
    manifestUrl: `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}surface=${surface}`,
  };
}
