import { NextRequest, NextResponse } from 'next/server';
import { createViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { isViewerEvent } from '@/application/reader/viewer-events';
import { getViewerTrafficGuard } from '@/composition/server/viewer-traffic';

export async function POST(request: NextRequest) {
  const rollout = createViewerRolloutConfig(process.env);
  const origin = request.headers.get('origin');
  if (origin && origin !== rollout.viewerOrigin) return new NextResponse(null, { status: 403 });
  const key = request.headers.get('x-real-ip') || origin || 'anonymous';
  if (!getViewerTrafficGuard().check(`event:${key}`).allowed) return new NextResponse(null, { status: 429 });
  const event: unknown = await request.json().catch(() => null);
  if (!isViewerEvent(event) || event.slug.length > 200) return NextResponse.json({ error: 'Invalid viewer event' }, { status: 400 });
  console.info(JSON.stringify({
    event: 'public_reader_viewer', origin, embedHost: getEmbedHost(request.headers.get('referer')),
    slug: event.slug, surface: event.surface, type: event.type,
    ...(event.metadataBytes === undefined ? {} : { metadataBytes: event.metadataBytes }),
    ...(event.durationMs === undefined ? {} : { durationMs: event.durationMs }),
    ...(event.requestCount === undefined ? {} : { requestCount: event.requestCount }),
    ...(event.cacheBehavior === undefined ? {} : { cacheBehavior: event.cacheBehavior }),
    ...(event.bundleBytes === undefined ? {} : { bundleBytes: event.bundleBytes }),
    ...(event.derivativeBandwidthBytes === undefined ? {} : { derivativeBandwidthBytes: event.derivativeBandwidthBytes }),
    ...(event.memoryBytes === undefined ? {} : { memoryBytes: event.memoryBytes }),
  }));
  return new NextResponse(null, { status: 204 });
}

function getEmbedHost(referer: string | null) {
  if (!referer) return null;
  try { return new URL(referer).hostname; } catch { return null; }
}
