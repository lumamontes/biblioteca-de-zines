import { NextRequest, NextResponse } from 'next/server';
import { createViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { getViewerReader } from '@/composition/server/public-reader';
import { createViewerReaderHttpResponse } from '@/app/api/public-reader/viewer-reader-response';
import { getViewerTrafficGuard } from '@/composition/server/viewer-traffic';
import { createReaderResponseHeaders } from '@/infrastructure/storage/cache-policy';
import { createViewerPreflightHeaders } from '@/application/reader/viewer-cors';
import { createViewerRequestMetric } from '@/application/reader/viewer-metrics';

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
    report('rate-limited', slug, surface, origin);
    return response({ error: 'Too many requests' }, 429, origin, rollout.viewerOrigin, traffic.remaining);
  }

  const result = await getViewerReader(slug, rollout, surface, betaToken);
  report(result.status === 'available' ? result.reader.status : result.status, slug, surface, origin);
  const http = createViewerReaderHttpResponse(result);
  return response(http.body, http.status, origin, rollout.viewerOrigin, traffic.remaining);
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

function report(status: string, slug: string, surface: 'reader' | 'embed', origin: string | null) {
  console.info(JSON.stringify(createViewerRequestMetric(status, slug, surface, origin)));
}
