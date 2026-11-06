import { parsePublicReaderResponse, type ReaderDeliveryMode, type PublicReaderResponse } from '@biblioteca-de-zines/reader';

export function createReaderRequestController(timeoutMs = 10_000) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cancel: () => {
      globalThis.clearTimeout(timeout);
      controller.abort();
    },
  };
}

export async function fetchPublicReader(
  origin: string,
  slug: string,
  surface: ReaderDeliveryMode,
  signal: AbortSignal,
): Promise<{ data: PublicReaderResponse; metadataBytes: number }> {
  const response = await fetch(`${origin.replace(/\/$/, '')}/api/public-reader/v1/${encodeURIComponent(slug)}?surface=${surface}`, {
    credentials: 'omit',
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error('Reader API unavailable');
  return {
    data: parsePublicReaderResponse(await response.json()),
    metadataBytes: Number(response.headers.get('content-length')) || 0,
  };
}
