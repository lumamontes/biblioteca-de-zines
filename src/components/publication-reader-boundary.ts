import type { ReaderInput } from "../../reader/src/contract";

export type PublicPublicationReaderData = {
  title: string;
  creator?: string;
  description?: string;
  externalPdfUrl: string;
  standardViewerUrl: string;
};

/** Maps Biblioteca metadata at the host boundary; the standalone reader owns no catalogue access. */
export function createPublicPublicationReaderInput(
  publication: PublicPublicationReaderData,
): ReaderInput {
  return {
    publication: { kind: "pdf", url: publication.externalPdfUrl },
    configuration: { provider: "direct-pdf", mode: "slide", layout: "responsive" },
    metadata: {
      title: publication.title,
      creator: publication.creator,
      description: publication.description,
    },
    fallback: {
      url: publication.standardViewerUrl,
      label: "Abrir visualizador padrão",
    },
  };
}
