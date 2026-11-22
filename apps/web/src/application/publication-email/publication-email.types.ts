export type PublicationEmail = {
  from: string;
  replyTo: string;
  to: string;
  subject: string;
  text: string;
};

export type PublicationEmailRecipient = {
  id: number;
  name: string;
  history?: { recipient: string; sentAt: string | null };
};

export type PublicationEmailRepository = {
  publication(zineId: number): Promise<{
    title: string;
    slug: string;
    authors: Pick<PublicationEmailRecipient, "id" | "name">[];
  }>;
  history(zineId: number): Promise<{ author_id: number; recipient: string; sent_at: string | null }[]>;
  reserve(zineId: number, authorId: number, recipient: string): Promise<void>;
  release(zineId: number, authorId: number): Promise<void>;
  complete(zineId: number, authorId: number, providerId: string): Promise<string>;
};

export type PublicationEmailSender = (message: PublicationEmail) => Promise<
  { status: "accepted"; id: string } | { status: "rejected" }
>;
