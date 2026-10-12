export interface ZineSourceRepository {
  updatePdfUrl(zineId: number, pdfUrl: string): Promise<void>;
}

export interface ZineProcessingRequester {
  request(zineId: number): Promise<void>;
}
