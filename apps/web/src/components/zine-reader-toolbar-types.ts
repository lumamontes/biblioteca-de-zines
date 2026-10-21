import type { ReactNode } from 'react';

export type ZineReaderToolbarProps = {
  embedCustomizer: ReactNode;
  onFullscreen: () => void;
  originalUrl: string;
  viewerUrl: string;
};
