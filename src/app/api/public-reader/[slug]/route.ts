import { NextRequest, NextResponse } from 'next/server';
import { serializePublicReaderResult } from '@/application/reader/public-reader-api';
import {
  createViewerRolloutConfig,
} from '@/application/reader/viewer-rollout';
import { getPublicReader } from '@/composition/server/public-reader';
import { getViewerTrafficGuard } from '@/composition/server/viewer-traffic';
import { createReaderResponseHeaders } from '@/infrastructure/storage/cache-policy';
import { createViewerPreflightHeaders } from '@/application/reader/viewer-cors';
import { resolveViewerAccess } from '@/application/reader/viewer-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const rollout = createViewerRolloutConfig(process.env);
  const origin = request.headers.get('origin');
  const surface = request.nextUrl.searchParams.get('surface') === 'reader' ? 'reader' : 'embed';
  const betaToken = request.headers.get('x-reader-beta-token') ?? undefined;
  const key = request.headers.get('x-real-ip') || origin || 'anonymous';
  const traffic = getViewerTrafficGuard().check(key);

  if (!traffic.allowed) {
    return response({ error: 'Too many requests' }, 429, origin, rollout.viewerOrigin, traffic.remaining);
  }

  const reader = await getPublicReader(slug);
  if (!reader) {
    report('not-found', slug);
    return response({ error: 'Publication not found' }, 404, origin, rollout.viewerOrigin, traffic.remaining);
  }

  const access = resolveViewerAccess(reader, slug, rollout, surface, betaToken);
  if (!access.allowed) {
    report('unavailable', access.canonicalSlug);
    return response({ error: 'Reader unavailable' }, 404, origin, rollout.viewerOrigin, traffic.remaining);
  }

  report(reader.status, slug);
  return response(serializePublicReaderResult(reader), 200, origin, rollout.viewerOrigin, traffic.remaining);
}

export async function OPTIONS(request: NextRequest) {
  const rollout = createViewerRolloutConfig(process.env);
  return new NextResponse(null, {
    headers: createViewerPreflightHeaders(request.headers.get('origin'), rollout.viewerOrigin),
    status: 204,
  });
}

function response(body: unknown, status: number, origin: string | null, viewerOrigin: string, remaining = 120) {
  const headers = createReaderResponseHeaders(origin, viewerOrigin, remaining);
  if (status === 204) {
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return new NextResponse(body === null ? null : JSON.stringify(body), { status, headers });
}

function report(status: string, slug: string) {
  console.info(JSON.stringify({ event: 'public_reader_request', slug, status }));
}
