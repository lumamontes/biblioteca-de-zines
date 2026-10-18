export const AUTHOR_LINK_METADATA_CACHE_TAG = "author-link-metadata";

export interface LinkMetadata {
  hasPreview: boolean;
  title: string;
  description: string;
  image: string;
  domain: string;
  favicon: string;
  siteName: string;
}
