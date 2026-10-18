export type ProcessingJob = {
  attemptCount: number;
  id: number;
  isPublished: boolean;
  pdfUrl: string;
  title: string;
  zineId: number;
};

export interface ProcessingJobStore {
  claimNext(zineId?: number): Promise<ProcessingJob | null>;
  complete(jobId: number, attemptCount: number): Promise<void>;
  enqueue(zineId: number): Promise<void>;
  fail(jobId: number, attemptCount: number, errorMessage: string): Promise<void>;
}

export type ProcessingProcessor = (job: ProcessingJob) => Promise<void>;

export interface ProcessingWorker {
  claimNext(zineId?: number): Promise<ProcessingJob | null>;
  enqueue(zineId: number): Promise<void>;
  processClaimed(job: ProcessingJob): Promise<'completed' | 'failed'>;
}
