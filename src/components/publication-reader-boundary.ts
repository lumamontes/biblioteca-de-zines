import type { ReaderInput } from "../../reader/src/contract";

export type PublicPublicationReaderData = {
  title: string;
  creator?: string;
  description?: string;
  externalPdfUrl: string;
  standardViewerUrl: string;
};

export type PublicationUrlRoute =
  | { kind: "google-drive"; fileId: string; readerUrl: string }
  | { kind: "direct-pdf"; readerUrl: string };

const GOOGLE_DRIVE_HOSTS = new Set(["drive.google.com", "www.drive.google.com"]);

/** Only Drive file links are routed through the fixed Google Drive integration. */
export function classifyPublicationUrl(url: string): PublicationUrlRoute {
  try {
    const parsed = new URL(url);
    const match = parsed.protocol === "https:" && GOOGLE_DRIVE_HOSTS.has(parsed.hostname)
      ? parsed.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/)
      : null;

    if (match) {
      const fileId = match[1];
      return {
        kind: "google-drive",
        fileId,
        readerUrl: `/api/publications/google-drive/${encodeURIComponent(fileId)}`,
      };
    }
  } catch {
    // Let the direct loader report malformed or inaccessible non-Drive URLs.
  }

  return { kind: "direct-pdf", readerUrl: url };
}

/** Maps Biblioteca metadata at the host boundary; the standalone reader owns no catalogue access. */
export function createPublicPublicationReaderInput(
  publication: PublicPublicationReaderData,
): ReaderInput {
  const route = classifyPublicationUrl(publication.externalPdfUrl);

  return {
    publication: { kind: "pdf", url: route.readerUrl },
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
