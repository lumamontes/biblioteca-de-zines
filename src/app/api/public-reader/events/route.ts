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
  if (!isViewerEvent(event)) return NextResponse.json({ error: 'Invalid viewer event' }, { status: 400 });
  if (event.slug.length > 200) return NextResponse.json({ error: 'Invalid viewer event' }, { status: 400 });

  console.info(JSON.stringify({
    event: 'public_reader_viewer',
    origin,
    ...event,
  }));
  return new NextResponse(null, { status: 204 });
}
