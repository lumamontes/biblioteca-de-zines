export type ProcessingJob = {
  attemptCount: number;
  id: number;
  isPublished: boolean;
  pdfUrl: string;
  title: string;
  zineId: number;
};

export interface ProcessingJobStore {
  claimNext(): Promise<ProcessingJob | null>;
  complete(jobId: number): Promise<void>;
  enqueue(zineId: number): Promise<void>;
  fail(jobId: number, errorMessage: string): Promise<void>;
}

export type ProcessingProcessor = (job: ProcessingJob) => Promise<void>;

export interface ProcessingWorker {
  claimNext(): Promise<ProcessingJob | null>;
  processClaimed(job: ProcessingJob): Promise<'completed' | 'failed'>;
}
