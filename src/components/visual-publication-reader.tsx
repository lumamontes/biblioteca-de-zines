"use client";

import { useEffect, useRef, useState } from "react";
import PDFViewer from "./pdf-viewer";
import { createPdfLoader } from "../../reader/src/pdf";
import { createReader } from "../../reader/src/reader";
import type { PdfJs } from "../../reader/src/pdf";
import type { ReaderBoundary, ReaderStatus } from "../../reader/src/contract";
import {
  createPublicPublicationReaderInput,
  type PublicPublicationReaderData,
} from "./publication-reader-boundary";

type VisualPublicationReaderProps = PublicPublicationReaderData;

export default function VisualPublicationReader(props: VisualPublicationReaderProps) {
  const [state, setState] = useState<ReaderStatus | null>(null);
  const [showStandardViewer, setShowStandardViewer] = useState(false);
  const readerRef = useRef<ReaderBoundary | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const input = createPublicPublicationReaderInput(props);

    async function start() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://unpkg.com/pdfjs-dist@6.3.289/build/pdf.worker.min.mjs";
        if (cancelled) return;

        const reader = createReader(input, {
          "direct-pdf": createPdfLoader(pdfjs as unknown as PdfJs),
        });
        readerRef.current = reader;
        const unsubscribe = reader.subscribe(setState);
        setState(reader.getState());
        await reader.load();
        if (cancelled) unsubscribe();
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "failure",
            metadata: input.metadata,
            message: error instanceof Error ? error.message : String(error),
            fallback: input.fallback,
          });
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
      readerRef.current?.destroy();
      readerRef.current = undefined;
    };
  }, [props]);

  const failed = state?.status === "failure" || state?.status === "page-failure";
  const ready = state?.status === "ready" ? state : undefined;
  const currentPage = ready?.pages.find((page) => page.index === ready.currentPage);
  const fallbackUrl = failed && state ? state.fallback.url : props.standardViewerUrl;

  if (showStandardViewer || failed) {
    return (
      <section aria-label="Visualização da publicação" className="flex h-full min-h-[70vh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-300 bg-white p-3 text-sm">
          <span>{failed ? "O leitor visual não pôde carregar esta publicação." : "Visualizador padrão"}</span>
          {!failed && (
            <button
              type="button"
              onClick={() => setShowStandardViewer(false)}
              className="underline"
            >
              Usar leitor visual
            </button>
          )}
        </div>
        <PDFViewer url={fallbackUrl} />
      </section>
    );
  }

  return (
    <section aria-label="Leitor visual da publicação" className="flex h-full min-h-[70vh] flex-col bg-neutral-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 bg-white p-3 text-sm">
        <span role="status">
          {state?.status === "loading" || !state ? "Carregando leitor visual..." : "Leitor visual"}
        </span>
        <div className="flex items-center gap-3">
          {ready && (
            <>
              <button type="button" onClick={() => readerRef.current?.previous()} disabled={ready.currentPage === 0}>
                Anterior
              </button>
              <span aria-live="polite">{ready.currentPage + 1} / {ready.pageCount}</span>
              <button type="button" onClick={() => readerRef.current?.next()} disabled={ready.currentPage === ready.pageCount - 1}>
                Próxima
              </button>
            </>
          )}
          <button type="button" onClick={() => setShowStandardViewer(true)} className="underline">
            Abrir visualizador padrão
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        {currentPage ? (
          <>
            {/* PDF.js produces browser-local reading derivatives, so Next image optimization is not applicable. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPage.url}
              alt={currentPage.alt ?? `${props.title}, página ${currentPage.index + 1}`}
              className="max-h-[68vh] max-w-full object-contain shadow-lg"
            />
          </>
        ) : (
          <p className="text-sm text-neutral-600">Aguarde o carregamento da primeira página.</p>
        )}
      </div>
    </section>
  );
}
