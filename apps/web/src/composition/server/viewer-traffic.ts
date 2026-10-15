import { createViewerTrafficGuard } from '@/infrastructure/reader/viewer-traffic-guard';

const trafficGuard = createViewerTrafficGuard({ limit: 120, windowMs: 60_000 });
export function getViewerTrafficGuard() { return trafficGuard; }
