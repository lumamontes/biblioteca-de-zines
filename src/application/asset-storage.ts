export type AssetKind = 'page' | 'cover';

export type AssetTarget = {
  id: number;
  kind: 'zine';
};

export type AssetUpload = {
  contentType: string;
  data: Buffer;
  generationId: string;
  height?: number;
  kind: AssetKind;
  pageNumber?: number;
  target: AssetTarget;
  width?: number;
};

export type AssetStorage = {
  deleteCover: (target: AssetTarget, coverUrl: string) => Promise<void>;
  deleteGeneration: (target: AssetTarget, generationId: string) => Promise<void>;
  deletePageGeneration: (target: AssetTarget, generationId: string) => Promise<void>;
  isCoverAvailable: (target: AssetTarget, coverUrl: string) => Promise<boolean>;
  upload: (asset: AssetUpload) => Promise<string>;
};
