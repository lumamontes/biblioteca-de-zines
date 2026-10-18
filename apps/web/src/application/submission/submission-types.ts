export type SubmissionAuthor = {
  name: string;
  socialLinks: string[];
};

export type SubmissionZine = {
  title: string;
  collectionTitle?: string;
  pdfUrl: string;
  description?: string;
  coverImageUrl?: string;
  year: string;
  categories?: string[];
};

export type SubmissionInput = {
  authors: SubmissionAuthor[];
  zines: SubmissionZine[];
  contactEmail: string;
};

export type SubmissionReceipt = {
  submissionBatchId: string;
  zineCount: number;
  zineTitles: string[];
  authorNames: string[];
};

export interface SubmissionRepository {
  create(input: SubmissionInput, submissionBatchId: string): Promise<SubmissionReceipt>;
}

export interface SubmissionNotifier {
  notify(input: SubmissionReceipt & { contactEmail: string }): Promise<void>;
}
