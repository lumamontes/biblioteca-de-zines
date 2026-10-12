export type AssetKind = 'page' | 'cover';

export type AssetTarget = {
  id: number;
  kind: 'zine';
};

export type AssetUpload = {
  contentType: string;
  data: Buffer;
  generationId: string;
  kind: AssetKind;
  pageNumber?: number;
  target: AssetTarget;
};

export type AssetStorage = {
  deleteCover: (target: AssetTarget, coverUrl: string) => Promise<void>;
  deleteGeneration: (target: AssetTarget, generationId: string) => Promise<void>;
  upload: (asset: AssetUpload) => Promise<string>;
};
