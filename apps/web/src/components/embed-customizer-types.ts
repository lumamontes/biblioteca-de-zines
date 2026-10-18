import type { ReaderEmbedConfiguration } from '@biblioteca-de-zines/reader';

export type EmbedCustomizerProps = {
  configuration: ReaderEmbedConfiguration;
  copyStatus: 'idle' | 'copied' | 'error';
  embedCode: string;
  onCopy: () => void;
  onUpdate: (next: Partial<ReaderEmbedConfiguration>) => void;
  triggerClassName?: string;
};

export type EmbedColorControlProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};
