export interface ProcessingRequester {
  request(zineId: number): Promise<void>;
}
