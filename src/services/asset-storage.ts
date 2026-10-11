export type AssetKind = 'page' | 'cover';

export type AssetTarget = {
  id: number;
  kind: 'form-upload' | 'zine';
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
  deleteGeneration: (target: AssetTarget, generationId: string) => Promise<void>;
  upload: (asset: AssetUpload) => Promise<string>;
};
