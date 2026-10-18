export type ReaderBranding = 'none' | 'biblioteca';

export type ReaderEmbedConfiguration = {
  background: string;
  branding: ReaderBranding;
  text: string;
};

export const DEFAULT_READER_EMBED_CONFIGURATION: ReaderEmbedConfiguration = {
  background: '#fafafa',
  branding: 'none',
  text: '#111111',
};

export function parseReaderEmbedConfiguration(values: { background?: string; branding?: string; text?: string }): ReaderEmbedConfiguration {
  return {
    background: isHexColor(values.background) ? values.background : DEFAULT_READER_EMBED_CONFIGURATION.background,
    branding: values.branding === 'biblioteca' ? 'biblioteca' : 'none',
    text: isHexColor(values.text) ? values.text : DEFAULT_READER_EMBED_CONFIGURATION.text,
  };
}

export function createConfiguredReaderEmbedUrl(embedUrl: string, configuration: ReaderEmbedConfiguration): string {
  const url = new URL(embedUrl);
  if (configuration.branding === 'biblioteca') url.searchParams.set('branding', configuration.branding);
  else url.searchParams.delete('branding');
  url.searchParams.set('background', configuration.background);
  url.searchParams.set('text', configuration.text);
  return url.toString();
}

function isHexColor(value: string | undefined): value is string {
  return value !== undefined && /^#[0-9a-f]{3,8}$/i.test(value);
}
