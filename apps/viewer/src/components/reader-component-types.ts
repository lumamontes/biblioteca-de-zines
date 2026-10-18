import type { ReaderBranding, ReaderDeliveryMode, ReaderEmbedConfiguration, ReaderFallbackLink } from '@biblioteca-de-zines/reader';

export type ReaderProps = {
  branding?: ReaderBranding;
  mode?: '1up' | '2up';
  page?: number;
  slug: string;
  surface: ReaderDeliveryMode;
  theme?: ReaderEmbedConfiguration;
};

export type ReaderFallbackProps = {
  branding: ReaderBranding;
  fallback: ReaderFallbackLink;
  surface: ReaderDeliveryMode;
  theme?: ReaderEmbedConfiguration;
  title: string;
};

export type ReaderHeaderProps = {
  branding: ReaderBranding;
  pdfUrl: string;
  title: string;
};
