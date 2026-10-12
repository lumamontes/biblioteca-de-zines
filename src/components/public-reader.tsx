import PDFViewer from '@/components/pdf-viewer';
import type { PublicReaderFallbackReason, PublicReaderResult } from '@/application/reader';

type PublicReaderProps = {
  reader: PublicReaderResult;
};

export function PublicReader({ reader }: PublicReaderProps) {
  if (reader.status === 'fallback') {
    return (
      <section aria-live="polite" className="w-full space-y-4" data-reader-state="fallback">
        <p className="border border-black bg-white p-4 text-sm">
          {fallbackMessage(reader.reason)}
        </p>
        {reader.fallback.url ? <PDFViewer url={reader.fallback.url} /> : (
          <p className="text-sm">O PDF original não está disponível.</p>
        )}
        {reader.fallback.url && (
          <a className="underline" href={reader.fallback.url} target="_blank" rel="noreferrer">
            {reader.fallback.label}
          </a>
        )}
      </section>
    );
  }

  const firstPage = reader.manifest.pages[0];
  return (
    <section
      aria-label={`Leitor de ${reader.publication.title}`}
      className="w-full space-y-4"
      data-reader-generation={reader.manifest.generationId}
      data-reader-state="ready"
    >
      <div className="flex min-h-[60vh] items-center justify-center bg-neutral-100 p-4">
        {/* Page derivatives may come from the configured custom asset domain. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`Página 1 de ${reader.manifest.pageCount}`}
          className="max-h-[70vh] max-w-full object-contain"
          height={firstPage.height}
          src={firstPage.imageUrl}
          width={firstPage.width}
        />
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span>{reader.manifest.pageCount} páginas disponíveis</span>
        <a className="underline" href={reader.fallback.url} target="_blank" rel="noreferrer">
          Abrir o PDF original
        </a>
      </div>
    </section>
  );
}

function fallbackMessage(reason: PublicReaderFallbackReason): string {
  switch (reason) {
    case 'page-generation-failed':
      return 'A leitura em páginas está temporariamente indisponível. O PDF original continua disponível.';
    case 'incomplete-page-generation':
      return 'A leitura em páginas ainda não está completa. Abra o PDF original enquanto ela é recuperada.';
    case 'source-unavailable':
      return 'O PDF original desta publicação não está disponível para leitura.';
    default:
      return 'A leitura em páginas ainda não está disponível. Abra o PDF original para continuar.';
  }
}
