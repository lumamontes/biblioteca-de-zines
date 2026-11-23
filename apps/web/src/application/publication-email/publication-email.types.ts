export type PublicationEmailKind = "published" | "invalid-link";

export type PublicationEmail = {
  from: string;
  replyTo: string;
  to: string;
  subject: string;
  text: string;
};

export type PublicationEmailRejection = "recipient" | "configuration" | "rate-limit";

export type PublicationEmailHistory = {
  recipient: string;
  sentAt: string | null;
  message?: PublicationEmail;
  rejection?: PublicationEmailRejection;
};

export type PublicationEmailRecipient = {
  id: number;
  name: string;
  history?: PublicationEmailHistory;
};

export type PublicationEmailRepository = {
  publication(zineId: number): Promise<{
    title: string;
    slug: string;
    sourceUrl?: string | null;
    authors: Pick<PublicationEmailRecipient, "id" | "name">[];
  }>;
  history(zineId: number): Promise<(PublicationEmailHistory & { authorId: number })[]>;
  reserve(zineId: number, authorId: number, message: PublicationEmail, attemptKey: string): Promise<void>;
  reject(attemptKey: string, reason: PublicationEmailRejection): Promise<void>;
  complete(attemptKey: string, providerId: string): Promise<string>;
};

export type PublicationEmailSender = (message: PublicationEmail, attemptKey: string) => Promise<
  { status: "accepted"; id: string } | { status: "rejected"; reason: PublicationEmailRejection }
>;
