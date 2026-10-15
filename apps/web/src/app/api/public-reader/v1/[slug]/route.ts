import { NextRequest, NextResponse } from 'next/server';
import { serializePublicReaderResult } from '@/application/reader/public-reader-api';
import { getPublicReader } from '@/composition/server/public-reader';

const configuredViewerOrigin = () => process.env.READER_VIEWER_ORIGIN ?? 'https://viewer.biblioteca-de-zines.com.br';
const requestWindow = new Map<string, { startedAt: number; count: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const origin = request.headers.get('origin');
  const viewerOrigin = configuredViewerOrigin();
  if (!isAllowedOrigin(origin, viewerOrigin)) return json({ error: 'Origin not allowed' }, 403, origin, viewerOrigin);
  const { slug } = await params;
  const surface = new URL(request.url).searchParams.get('surface') ?? 'reader';
  if (surface !== 'reader' && surface !== 'embed') return json({ error: 'Invalid reader surface' }, 400, origin, viewerOrigin);
  if (!isFeatureEnabled(surface)) return json({ error: 'Reader unavailable' }, 404, origin, viewerOrigin);
  if (!isBetaPublicationAllowed(slug)) return json({ error: 'Reader unavailable' }, 404, origin, viewerOrigin);
  if (!withinRateLimit(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown')) return json({ error: 'Too many requests' }, 429, origin, viewerOrigin);
  const reader = await getPublicReader(slug);
  if (!reader) return json({ error: 'Publication not found' }, 404, origin, viewerOrigin);
  return json(serializePublicReaderResult(reader), 200, origin, viewerOrigin);
}

export function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const viewerOrigin = configuredViewerOrigin();
  if (!isAllowedOrigin(origin, viewerOrigin)) return json({ error: 'Origin not allowed' }, 403, origin, viewerOrigin);
  return json(null, 204, origin, viewerOrigin);
}

function isAllowedOrigin(origin: string | null, viewerOrigin: string) {
  return origin === null || origin === viewerOrigin;
}

function isFeatureEnabled(surface: 'reader' | 'embed') {
  const value = process.env[surface === 'embed' ? 'READER_EMBED_ENABLED' : 'READER_VIEWER_ENABLED'];
  return value !== 'false';
}

function isBetaPublicationAllowed(slug: string) {
  const configured = process.env.READER_BETA_PUBLICATION_SLUGS;
  if (!configured) return true;
  return configured.split(',').map((value) => value.trim()).filter(Boolean).includes(slug);
}

function withinRateLimit(key: string) {
  const now = Date.now();
  for (const [storedKey, entry] of requestWindow) {
    if (now - entry.startedAt >= RATE_WINDOW_MS) requestWindow.delete(storedKey);
  }
  const current = requestWindow.get(key);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    requestWindow.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  return true;
}

function json(body: unknown, status: number, origin: string | null, viewerOrigin: string) {
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin', 'X-Content-Type-Options': 'nosniff' });
  if (origin === viewerOrigin) headers.set('Access-Control-Allow-Origin', origin);
  if (status === 204) {
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return new NextResponse(body === null ? null : JSON.stringify(body), { status, headers });
}
