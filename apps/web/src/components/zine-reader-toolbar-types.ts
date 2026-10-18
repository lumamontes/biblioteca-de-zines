import type { ReactNode } from 'react';

export type ZineReaderToolbarProps = {
  downloadUrl: string;
  embedCustomizer: ReactNode;
  mobileEmbedCustomizer: ReactNode;
  onFullscreen: () => void;
  viewerUrl: string;
};
