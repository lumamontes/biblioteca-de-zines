import type { ReaderPageManifest, ReaderPageImage } from './manifest';

export type ReaderFallback = { label: string; url: string };
export type ReaderFallbackReason =
  | 'incomplete-page-generation'
  | 'page-generation-failed'
  | 'page-generation-unavailable'
  | 'reader-failure'
  | 'source-unavailable';
export type PublicReaderPublication = { id: number; slug: string; title: string };
export type PublicReaderResponse =
  | { status: 'ready'; fallback: ReaderFallback; manifest: ReaderPageManifest; publication: PublicReaderPublication }
  | { status: 'fallback'; fallback: ReaderFallback; publication?: PublicReaderPublication; reason: ReaderFallbackReason };

export class ReaderContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReaderContractError';
  }
}

export function parsePublicReaderResponse(value: unknown): PublicReaderResponse {
  if (!isRecord(value) || (value.status !== 'ready' && value.status !== 'fallback')) throw new ReaderContractError('Invalid public reader status');
  const fallback = parseFallback(value.fallback);
  const publication = value.publication === undefined ? undefined : parsePublication(value.publication);
  if (value.status === 'fallback') {
    if (!isFallbackReason(value.reason)) throw new ReaderContractError('Invalid public reader fallback reason');
    return { status: 'fallback', fallback, ...(publication ? { publication } : {}), reason: value.reason };
  }
  if (!publication) throw new ReaderContractError('Ready reader response is missing publication');
  return { status: 'ready', fallback, publication, manifest: parseManifest(value.manifest) };
}

function parseManifest(value: unknown): ReaderPageManifest {
  if (!isRecord(value) || typeof value.generationId !== 'string' || !value.generationId.trim() || !isPositiveInteger(value.pageCount) || !Array.isArray(value.pages) || value.pages.length !== value.pageCount) throw new ReaderContractError('Invalid reader page manifest');
  const pages = value.pages.map((page, index) => {
    if (!isRecord(page) || page.generationId !== value.generationId || page.pageNumber !== index + 1 || typeof page.imageUrl !== 'string' || !isSafeUrl(page.imageUrl) || !page.imageUrl.trim() || !isPositiveNumber(page.width) || !isPositiveNumber(page.height)) throw new ReaderContractError('Invalid reader page');
    return page as unknown as ReaderPageImage;
  });
  return { generationId: value.generationId, pageCount: value.pageCount, pages };
}

function parseFallback(value: unknown): ReaderFallback {
  if (!isRecord(value) || typeof value.label !== 'string' || typeof value.url !== 'string' || !isSafeUrl(value.url)) throw new ReaderContractError('Invalid reader fallback');
  return { label: value.label, url: value.url };
}

function parsePublication(value: unknown): PublicReaderPublication {
  if (!isRecord(value) || typeof value.id !== 'number' || typeof value.slug !== 'string' || typeof value.title !== 'string') throw new ReaderContractError('Invalid reader publication');
  return { id: value.id, slug: value.slug, title: value.title };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFallbackReason(value: unknown): value is ReaderFallbackReason {
  return value === 'incomplete-page-generation' || value === 'page-generation-failed' || value === 'page-generation-unavailable' || value === 'reader-failure' || value === 'source-unavailable';
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isSafeUrl(value: string): boolean {
  if (!value) return true;
  if (value.startsWith('/')) return !value.startsWith('//');
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
