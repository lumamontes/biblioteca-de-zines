import type { ReactNode } from 'react';
import type { ZineReadingSurface } from '@/application/reader/reading-surface.types';

export type ZineUnavailableReadingSurfaceProps = {
  sidebar: ReactNode;
  sidebarHeader: ReactNode;
  surface: ZineReadingSurface;
};
