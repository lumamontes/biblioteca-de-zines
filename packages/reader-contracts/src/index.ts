export type { ReaderPageImage, ReaderPageManifest } from './manifest';
export type ReaderDeliveryMode = 'standalone' | 'embed';
export {
  parsePublicReaderResponse,
  ReaderContractError,
  type PublicReaderZine,
  type PublicReaderResponse,
  type ReaderFallbackLink,
  type ReaderFallbackReason,
} from './public-reader-response';
export {
  createConfiguredReaderEmbedUrl,
  DEFAULT_READER_EMBED_CONFIGURATION,
  parseReaderEmbedConfiguration,
  type ReaderBranding,
  type ReaderEmbedConfiguration,
} from './embed-configuration';
