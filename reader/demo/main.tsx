import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createPdfLoader } from '../src/pdf';
import { createPageTurnRenderer } from '../src/page-turn';
import type { ReaderPage } from '../src/contract';
import './lab.css';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const RAW = 'https://raw.githubusercontent.com';
const sources = {
  colors: {
    id: 'colors', title: 'Colors', creator: 'VisionFever', kind: 'images' as const,
    description: 'The first 12 pages of an ordered image set from lumamontes/visionfever-website.',
    urls: Array.from({ length: 12 }, (_, index) => `${RAW}/lumamontes/visionfever-website/main/public/images/zines/zine-colors/pages/${index + 1}.jpg`),
    source: 'VisionFever / public/images/zines/zine-colors/pages/*.jpg',
  },
  borderline: {
    id: 'borderline', title: 'The Borderline Literary Magazine', creator: 'Borderline', kind: 'pdf' as const,
    description: 'A real PDF from lumamontes/borderline-magazine, rendered by PDF.js.',
    url: `${RAW}/lumamontes/borderline-magazine/main/public/zine.pdf`,
    source: 'Borderline / public/zine.pdf',
  },
  broken: {
    id: 'broken', title: 'Broken source (intentional)', creator: 'Failure path', kind: 'images' as const,
    description: 'A deliberately unavailable URL. Use it to verify fallback and diagnostics.',
    urls: ['https://raw.githubusercontent.com/lumamontes/does-not-exist/main/page.jpg'],
    source: 'Intentional 404; not publication content',
  },
};
type Source = (typeof sources)[keyof typeof sources];
type SourceId = keyof typeof sources;
type EngineId = 'react-pageflip' | 'page-flip' | 'bookreader' | 'slide';
type Engine = { id: EngineId; label: string; note: string };
const engines: Engine[] = [
  { id: 'react-pageflip', label: 'React PageFlip', note: 'VisionFever pattern: stable forwarded Page components.' },
  { id: 'page-flip', label: 'Direct PageFlip', note: 'Existing baseline adapter, mounted directly.' },
  { id: 'bookreader', label: 'Internet Archive BookReader', note: 'Borderline browser-bundle integration.' },
  { id: 'slide', label: 'Stable slide', note: 'Control: no page-turn illusion.' },
];

type LabPage = ReaderPage & { width?: number; height?: number };
type Materialized = { pages: LabPage[]; elapsed: number; sourceStatus: string };

function loadImage(url: string, index: number): Promise<LabPage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ index, url, alt: `Publication page ${index + 1}`, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error(`Image page ${index + 1} failed: ${url}`));
    image.src = url;
  });
}

async function materialize(source: Source): Promise<Materialized> {
  const started = performance.now();
  if (source.kind === 'images') {
    const pages = await Promise.all(source.urls.map((url, index) => loadImage(url, index)));
    return { pages, elapsed: performance.now() - started, sourceStatus: 'Browser image requests completed' };
  }
  const loader = createPdfLoader(pdfjs, { scale: 1.2 });
  const document = await loader({ kind: 'pdf', url: source.url });
  const pages = [] as LabPage[];
  for (let index = 0; index < document.pageCount; index += 1) {
    pages.push(await document.loadPage(index));
  }
  document.cleanup?.();
  return { pages, elapsed: performance.now() - started, sourceStatus: 'PDF.js loaded and rendered every page' };
}

const Page = forwardRef<HTMLDivElement, { page: LabPage }>((props, ref) => (
  <div ref={ref} className="flip-page" data-density={props.page.index === 0 || props.page.index === 84 ? 'hard' : 'soft'}>
    <img src={props.page.url} alt={props.page.alt} draggable={false} />
  </div>
));
Page.displayName = 'Page';

type ReactFlipHandle = { next: () => void; previous: () => void; destroy: () => void };
const ReactPageFlipEngine = forwardRef<ReactFlipHandle, { pages: LabPage[]; onPage: (page: number) => void }>(function ReactPageFlipEngine({ pages, onPage }, ref) {
  const book = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } }>(null);
  useImperativeHandle(ref, () => ({
    next: () => book.current?.pageFlip().flipNext(),
    previous: () => book.current?.pageFlip().flipPrev(),
    destroy: () => undefined,
  }), []);
  return <HTMLFlipBook
    ref={book}
    width={420}
    height={600}
    size="stretch"
    minWidth={220}
    maxWidth={620}
    minHeight={314}
    maxHeight={886}
    maxShadowOpacity={0.45}
    showCover
    mobileScrollSupport
    style={{ backgroundColor: '#f6f0e5' }}
    onFlip={(event: { data: number }) => onPage(event.data)}
    startPage={0}
    drawShadow
    flippingTime={window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 900}
    usePortrait={window.innerWidth < 760}
    startZIndex={0}
    autoSize={false}
    clickEventForward={false}
    useMouseEvents
    swipeDistance={30}
    showPageCorners
    disableFlipByClick
    className="react-flip-book"
  >
    {pages.map((page) => <Page key={page.index} page={page} />)}
  </HTMLFlipBook>;
});
ReactPageFlipEngine.displayName = 'ReactPageFlipEngine';

type BookReaderWindow = Window & { jQuery?: unknown; BookReader?: new (options: Record<string, unknown>) => Record<string, any> };
async function loadBookReaderAssets(): Promise<void> {
  const browser = window as BookReaderWindow;
  if (!browser.jQuery) await loadScript('https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@5.0.0-87/BookReader/jquery-3.js');
  if (!document.querySelector('link[data-bookreader-css]')) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.dataset.bookreaderCss = 'true';
    link.href = 'https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.css'; document.head.append(link);
  }
  if (!browser.BookReader) await loadScript('https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.js');
}
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = src; script.onload = () => resolve(); script.onerror = () => reject(new Error(`BookReader asset failed: ${src}`)); document.head.append(script); });
}

async function mountBookReader(container: HTMLElement, pages: LabPage[]): Promise<{ next: () => void; previous: () => void; destroy: () => void }> {
  await loadBookReaderAssets();
  const browser = window as BookReaderWindow;
  if (!browser.BookReader) throw new Error('BookReader browser bundle did not expose window.BookReader.');
  const target = document.createElement('div'); target.className = 'bookreader-target'; container.append(target);
  let current = 0;
  const reader = new browser.BookReader({
    el: target,
    data: pages.map((page) => [{ width: page.width ?? 800, height: page.height ?? 1000, uri: page.url, reduce: 1 }]),
    bookId: 'comparison-lab', bookTitle: 'Comparison lab', ui: 'full', controls: { embed: false, share: false, info: false },
  });
  reader.getPageWidth = () => pages[0]?.width ?? 800;
  reader.getPageHeight = () => pages[0]?.height ?? 1000;
  reader.getPageURI = (index: number) => pages[index]?.url ?? '';
  reader.getPageSide = () => 'R'; reader.getPageNum = (index: number) => index + 1;
  reader.getSpreadIndices = (index: number) => [index]; reader.numLeafs = pages.length; reader.mode = reader.constMode2up || 2; reader.reduce = 2;
  reader.init();
  const jump = (delta: number) => { current = Math.max(0, Math.min(pages.length - 1, current + delta)); reader.jumpToIndex?.(current); };
  return { next: () => jump(1), previous: () => jump(-1), destroy: () => { reader.cleanup?.(); target.remove(); } };
}

function App() {
  const [sourceId, setSourceId] = useState<SourceId>('colors');
  const [engineId, setEngineId] = useState<EngineId>('react-pageflip');
  const [materialized, setMaterialized] = useState<Materialized | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [engineError, setEngineError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const direct = useRef<ReturnType<typeof createPageTurnRenderer> | null>(null);
  const reactRoot = useRef<Root | null>(null);
  const reactEngine = useRef<ReactFlipHandle | null>(null);
  const externalEngine = useRef<{ next: () => void; previous: () => void; destroy: () => void } | null>(null);
  const source = sources[sourceId];
  const engine = engines.find((item) => item.id === engineId)!;

  useEffect(() => {
    let cancelled = false; setLoading(true); setError(''); setMaterialized(null); setCurrent(0);
    void materialize(source).then((next) => { if (!cancelled) { setMaterialized(next); setLoading(false); } }).catch((reason: unknown) => { if (!cancelled) { setError(reason instanceof Error ? reason.message : String(reason)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [sourceId]);

  useEffect(() => {
    direct.current?.destroy(); direct.current = null; externalEngine.current?.destroy(); externalEngine.current = null; reactRoot.current?.unmount(); reactRoot.current = null; reactEngine.current = null; host.current?.replaceChildren(); setEngineError('');
    if (!materialized || !host.current) return;
    if (engineId === 'slide') return;
    if (engineId === 'react-pageflip') { reactRoot.current = createRoot(host.current); reactRoot.current.render(<ReactPageFlipEngine ref={reactEngine} pages={materialized.pages} onPage={setCurrent} />); return; }
    if (engineId === 'page-flip') { const renderer = createPageTurnRenderer({ reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches }); renderer.mount(host.current, materialized.pages, { pageCount: materialized.pages.length, currentPage: 0, wideViewport: window.innerWidth >= 760, onPageChange: setCurrent }); direct.current = renderer; return; }
    void mountBookReader(host.current, materialized.pages).then((adapter) => { externalEngine.current = adapter; }).catch((reason: unknown) => setEngineError(reason instanceof Error ? reason.message : String(reason)));
    return () => { direct.current?.destroy(); externalEngine.current?.destroy(); reactRoot.current?.unmount(); };
  }, [materialized, engineId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); move(1); }
      if (event.key === 'Home') { event.preventDefault(); setCurrent(0); }
      if (event.key === 'End' && materialized) { event.preventDefault(); setCurrent(materialized.pages.length - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const move = (delta: number) => { const next = Math.max(0, Math.min((materialized?.pages.length ?? 1) - 1, current + delta)); setCurrent(next); if (engineId === 'react-pageflip') delta > 0 ? reactEngine.current?.next() : reactEngine.current?.previous(); if (engineId === 'page-flip') delta > 0 ? direct.current?.next() : direct.current?.previous(); if (engineId === 'bookreader') delta > 0 ? externalEngine.current?.next() : externalEngine.current?.previous(); };
  const goFullscreen = () => { if (host.current?.requestFullscreen) void host.current.requestFullscreen(); setFullscreen((value) => !value); };
  const slidePage = materialized?.pages[current];

  return <div className="lab-shell">
    <header className="masthead"><div><span className="eyebrow">Standalone comparison lab</span><h1>Same pages. Four reading surfaces.</h1></div><p>Demo-only instrumentation for visual publication readers. No tool is the final choice.</p></header>
    <section className="library" aria-label="Demo library"><div className="section-label">Choose a real source</div><div className="source-grid">{Object.entries(sources).map(([id, item]) => <button key={id} className={id === sourceId ? 'source-card selected' : 'source-card'} onClick={() => setSourceId(id as SourceId)} type="button"><strong>{item.title}</strong><span>{item.description}</span><small>{item.source}</small></button>)}</div></section>
    <main className={fullscreen ? 'reader-panel fullscreen' : 'reader-panel'}><div className="reader-heading"><div><span className="eyebrow">{source.creator}</span><h2>{source.title}</h2></div><span className="honesty">Comparison, not a recommendation</span></div>
      <div className="engine-tabs" role="tablist" aria-label="Reader engines">{engines.map((item) => <button key={item.id} role="tab" aria-selected={item.id === engineId} onClick={() => setEngineId(item.id)} type="button"><strong>{item.label}</strong><small>{item.note}</small></button>)}</div>
      <div className="reader-stage"><div className="stage-backdrop" />{loading && <div className="state"><strong>Materializing every page</strong><span>Nothing turns until the source is complete.</span></div>}{error && <div className="state failure"><strong>Source unavailable</strong><span>{error}</span><button type="button" onClick={() => setEngineId('slide')}>Use stable slide</button></div>}{!loading && !error && materialized && engineId === 'slide' && slidePage && <img className="slide-page" src={slidePage.url} alt={slidePage.alt} />}{!loading && !error && materialized && <div ref={host} className="engine-host" aria-label={`${engine.label} surface`} />}{engineError && <div className="state failure"><strong>Engine unavailable</strong><span>{engineError}</span><button type="button" onClick={() => setEngineId('slide')}>Use stable slide</button></div>}</div>
      <div className="reader-controls"><button type="button" onClick={() => move(-1)} disabled={current === 0 || loading}>Previous</button><span aria-live="polite">Page {materialized ? current + 1 : 0} / {materialized?.pages.length ?? 0}</span><button type="button" onClick={() => move(1)} disabled={!materialized || current === materialized.pages.length - 1}>Next</button><button type="button" onClick={goFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen / fit'}</button></div>
    </main>
    <aside className="diagnostics"><div><span>Engine</span><strong>{engine.label}</strong></div><div><span>Source</span><strong>{source.source}</strong></div><div><span>Pages</span><strong>{materialized?.pages.length ?? '—'}</strong></div><div><span>Preload</span><strong>{materialized ? `${Math.round(materialized.elapsed)} ms` : '—'}</strong></div><div><span>Status</span><strong>{error || engineError || materialized?.sourceStatus || 'waiting'}</strong></div></aside>
    <footer>Keyboard: <kbd>←</kbd> <kbd>→</kbd> page turn, <kbd>Home</kbd> / <kbd>End</kbd> bounds. Reduced motion disables the long turn animation.</footer>
  </div>;
}

const root = document.querySelector('#app');
if (!root) throw new Error('Missing comparison lab root.');
createRoot(root).render(<App />);
