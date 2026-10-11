export type AssetKind = 'page' | 'cover';

export type AssetUpload = {
  contentType: string;
  data: Buffer;
  generationId: string;
  kind: AssetKind;
  pageNumber?: number;
  zineId: number;
};

export type AssetStorage = {
  deleteGeneration: (zineId: number, generationId: string) => Promise<void>;
  upload: (asset: AssetUpload) => Promise<string>;
};
