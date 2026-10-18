export function collectReaderPerformanceMetrics(origin: string): Record<string, number | string> {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const apiEntries = entries.filter((entry) => entry.name.startsWith(origin));
  const bundleBytes = entries
    .filter((entry) => entry.name.includes('cdn.jsdelivr.net') && entry.name.endsWith('.js'))
    .reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0), 0);
  const derivativeEntries = entries.filter((entry) => /\.(?:webp|jpg|jpeg|png)(?:\?|$)/i.test(entry.name));
  const derivativeBandwidthBytes = derivativeEntries.reduce(
    (total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0),
    0,
  );
  const cacheBehavior = derivativeEntries.length === 0
    ? 'unknown'
    : derivativeEntries.some((entry) => entry.transferSize === 0) ? 'hit' : 'miss';
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;

  return {
    requestCount: apiEntries.length + derivativeEntries.length,
    bundleBytes,
    derivativeBandwidthBytes,
    cacheBehavior,
    ...(memory === undefined ? {} : { memoryBytes: memory }),
  };
}
