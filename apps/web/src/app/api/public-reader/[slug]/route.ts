import { NextRequest, NextResponse } from 'next/server';
import { createViewerRolloutConfig, validateViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { getViewerReader } from '@/composition/server/public-reader';
import { createViewerReaderHttpResponse } from '@/app/api/public-reader/viewer-reader-response';
import { getViewerTrafficGuard } from '@/composition/server/viewer-traffic';
import { createReaderResponseHeaders } from '@/infrastructure/storage/cache-policy';
import { createViewerPreflightHeaders } from '@/application/reader/viewer-cors';
import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';
import { createViewerRequestMetric } from '@/application/reader/viewer-metrics';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rollout = createViewerRolloutConfig(process.env);
  const origin = request.headers.get('origin');
  const surface: ReaderDeliveryMode = ['reader', 'standalone'].includes(request.nextUrl.searchParams.get('surface') ?? '') ? 'standalone' : 'embed';
  if (!validateViewerRolloutConfig(rollout).ready) return response({ error: 'Viewer rollout is unavailable' }, 503, origin, rollout.viewerOrigin);
  const traffic = getViewerTrafficGuard().check(request.headers.get('x-real-ip') || origin || 'anonymous');
  if (!traffic.allowed) {
    report('rate-limited', slug, surface, origin);
    return response({ error: 'Too many requests' }, 429, origin, rollout.viewerOrigin, traffic.remaining);
  }
  const result = await getViewerReader(slug, rollout);
  report(result.status === 'available' ? result.reader.status : result.status, slug, surface, origin);
  const http = createViewerReaderHttpResponse(result);
  return response(http.body, http.status, origin, rollout.viewerOrigin, traffic.remaining);
}

export function OPTIONS(request: NextRequest) {
  const rollout = createViewerRolloutConfig(process.env);
  return new NextResponse(null, { headers: createViewerPreflightHeaders(request.headers.get('origin'), rollout.viewerOrigin), status: 204 });
}

function response(body: unknown, status: number, origin: string | null, viewerOrigin: string, remaining = 120) {
  return new NextResponse(JSON.stringify(body), { status, headers: createReaderResponseHeaders(origin, viewerOrigin, remaining) });
}

function report(status: string, slug: string, surface: ReaderDeliveryMode, origin: string | null) {
  console.info(JSON.stringify(createViewerRequestMetric(status, slug, surface, origin)));
}
