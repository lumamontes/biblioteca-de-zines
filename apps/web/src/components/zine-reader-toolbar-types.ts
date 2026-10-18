import type { ReactNode } from 'react';

export type ZineReaderToolbarProps = {
  embedCustomizer: ReactNode;
  mobileEmbedCustomizer: ReactNode;
  onFullscreen: () => void;
  originalUrl: string;
};
