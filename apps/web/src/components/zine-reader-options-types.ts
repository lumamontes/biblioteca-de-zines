import type { ReactNode } from 'react';
import type { AvailableZineReadingSurface } from '@/application/reader/reading-surface';

export type ReaderDisplayMode = 'pdf' | 'beta';
export type { AvailableZineReadingSurface } from '@/application/reader/reading-surface';

export type ReaderModeTabsProps = {
  pageCount: number;
  value: ReaderDisplayMode;
  onChange: (mode: ReaderDisplayMode) => void;
};

export type ReaderModeTabProps = {
  active: boolean;
  ariaLabel?: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

export type ZineReaderOptionsProps = {
  initialMode: ReaderDisplayMode;
  surface: AvailableZineReadingSurface;
};
