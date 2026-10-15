export type ViewerTrafficDecision = { allowed: boolean; remaining: number };

export function createViewerTrafficGuard({ limit, maxKeys = 10_000, windowMs, now = Date.now }: {
  limit: number;
  maxKeys?: number;
  windowMs: number;
  now?: () => number;
}) {
  const windows = new Map<string, { count: number; startedAt: number }>();
  return {
    check(key: string): ViewerTrafficDecision {
      const currentTime = now();
      for (const [storedKey, storedWindow] of windows) {
        if (currentTime - storedWindow.startedAt >= windowMs) windows.delete(storedKey);
      }
      if (!windows.has(key) && windows.size >= maxKeys) windows.delete(windows.keys().next().value as string);
      const current = windows.get(key);
      const window = !current || currentTime - current.startedAt >= windowMs ? { count: 0, startedAt: currentTime } : current;
      window.count += 1;
      windows.set(key, window);
      return { allowed: window.count <= limit, remaining: Math.max(0, limit - window.count) };
    },
  };
}
