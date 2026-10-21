export type EmbedCustomizerProps = {
  copyStatus: 'idle' | 'copied' | 'error';
  embedCode: string;
  onCopy: () => void;
  previewUrl: string;
  title: string;
  triggerClassName?: string;
};

export type EmbedColorControlProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};
