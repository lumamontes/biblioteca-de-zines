export type NovidadeKind = "biblioteca" | "site";

export type NerdChangeKind =
  | "adicionado"
  | "alterado"
  | "descontinuado"
  | "removido"
  | "corrigido"
  | "seguranca";

export interface NovidadeMedia {
  kind: "image" | "video";
  src: string;
  alt: string;
  caption?: string;
}

export interface PublicNovidade {
  title: string;
  summary: string;
  body: string[];
  eventDate?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  media?: NovidadeMedia[];
}

export interface NerdNovidade {
  kind: NerdChangeKind;
  summary: string;
  pullRequests: Array<{
    number: number;
    url: string;
  }>;
}

export interface Novidade {
  slug: string;
  date: string;
  kind: NovidadeKind;
  historic?: boolean;
  public?: PublicNovidade;
  nerds?: NerdNovidade;
}
