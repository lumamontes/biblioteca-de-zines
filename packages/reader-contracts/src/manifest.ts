export type ReaderPageImage = {
  generationId: string;
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
};

export type ReaderPageManifest = {
  generationId: string;
  pageCount: number;
  pages: readonly ReaderPageImage[];
};
