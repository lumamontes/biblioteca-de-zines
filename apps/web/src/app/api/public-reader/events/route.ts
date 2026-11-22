import { countViewerEvent } from '@/composition/server/viewer-events';
import { NextRequest, NextResponse } from 'next/server';
import { createViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { isViewerEvent, MAX_VIEWER_EVENT_BYTES } from '@/application/reader/viewer-events';
import { getViewerTrafficGuard } from '@/composition/server/viewer-traffic';
import { createViewerPreflightHeaders } from '@/application/reader/viewer-cors';

export function OPTIONS(request: NextRequest) {
  const rollout = createViewerRolloutConfig(process.env);
  return new NextResponse(null, { headers: createViewerPreflightHeaders(request.headers.get('origin'), rollout.viewerOrigin), status: 204 });
}

export async function POST(request: NextRequest) {
  const rollout = createViewerRolloutConfig(process.env);
  const origin = request.headers.get('origin');
  if (origin && origin !== rollout.viewerOrigin) return new NextResponse(null, { status: 403 });
  const key = request.headers.get('x-real-ip') || origin || 'anonymous';
  if (!getViewerTrafficGuard().check(`event:${key}`).allowed) return new NextResponse(null, { status: 429 });
  const { status, event } = await readViewerEvent(request);
  const headers = createViewerPreflightHeaders(origin, rollout.viewerOrigin);
  if (status === 413) return NextResponse.json({ error: 'Viewer event too large' }, { status, headers });
  if (!isViewerEvent(event)) return NextResponse.json({ error: 'Invalid viewer event' }, { status: 400, headers });
  const surface = event.surface === 'reader' ? 'standalone' : event.surface;
  if (event.type !== 'page-load') {
    try {
      await countViewerEvent(event.slug, surface, event.type);
    } catch {
      console.warn('reader_event_count_unavailable');
    }
  }
  console.info(JSON.stringify({
    event: 'public_reader_viewer', origin, embedHost: getEmbedHost(request.headers.get('referer')),
    slug: event.slug, surface, type: event.type,
    ...(event.metadataBytes === undefined ? {} : { metadataBytes: event.metadataBytes }),
    ...(event.durationMs === undefined ? {} : { durationMs: event.durationMs }),
    ...(event.requestCount === undefined ? {} : { requestCount: event.requestCount }),
    ...(event.cacheBehavior === undefined ? {} : { cacheBehavior: event.cacheBehavior }),
    ...(event.bundleBytes === undefined ? {} : { bundleBytes: event.bundleBytes }),
    ...(event.derivativeBandwidthBytes === undefined ? {} : { derivativeBandwidthBytes: event.derivativeBandwidthBytes }),
    ...(event.memoryBytes === undefined ? {} : { memoryBytes: event.memoryBytes }),
  }));
  return new NextResponse(null, { headers, status: 204 });
}

async function readViewerEvent(request: NextRequest): Promise<{ status: 200 | 400 | 413; event?: unknown }> {
  if (Number(request.headers.get('content-length')) > MAX_VIEWER_EVENT_BYTES) return { status: 413 };
  if (!request.body) return { status: 400 };

  const reader = request.body.getReader();
  const bytes = new Uint8Array(MAX_VIEWER_EVENT_BYTES);
  let length = 0;
  try {
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      if (length + chunk.value.byteLength > bytes.length) {
        void reader.cancel().catch(() => undefined);
        return { status: 413 };
      }
      bytes.set(chunk.value, length);
      length += chunk.value.byteLength;
    }
    const event: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, length)));
    return { status: 200, event };
  } catch {
    return { status: 400 };
  } finally {
    reader.releaseLock();
  }
}

function getEmbedHost(referer: string | null) {
  if (!referer) return null;
  try { return new URL(referer).hostname; } catch { return null; }
}
