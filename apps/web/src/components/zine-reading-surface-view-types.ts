import type { ReactNode } from 'react';
import type { ZineReadingSurface } from '@/application/reader/reading-surface';
import type { ReaderDisplayMode } from './zine-reader-options-types';

export type ZineReadingSurfaceViewProps = {
  initialMode: ReaderDisplayMode;
  sidebar: ReactNode;
  sidebarHeader: ReactNode;
  surface: ZineReadingSurface;
};
