export type UpdateKind = "community" | "site";

export interface UpdateMedia {
  kind: "image" | "video";
  src: string;
  alt: string;
  caption?: string;
}

export interface PublicUpdate {
  title: string;
  summary: string;
  body: string[];
  eventDate?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  media?: UpdateMedia[];
}

export interface Update {
  slug: string;
  date: string;
  kind: UpdateKind;
  historic?: boolean;
  public?: PublicUpdate;
}
