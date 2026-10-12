import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createPdfLoader } from './pdf';
import { createPageTurnRenderer } from './page-turn';
import { createReader, imagePageSurface, imagePagesLoader } from './reader';
import type { ReaderBoundary, ReaderInput, ReaderMode, ReaderStatus } from './contract';
import { imageFixture, incompatiblePdfFixture } from './fixtures';
import './demo.css';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing demo root.');
const app: HTMLDivElement = root;

let reader: ReaderBoundary;
let input: ReaderInput = imageFixture;
let pageTurnMounted = false;
let renderedMode: ReaderMode | undefined;

const pageTurnRenderer = createPageTurnRenderer({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
});

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

app.innerHTML = `
  <div class="reader-app">
    <header class="masthead">
      <a class="wordmark" href="/demo/" aria-label="Reader demo home">Biblioteca <span>Reader</span></a>
      <p class="masthead-note">A small room for visual publications</p>
    </header>
    <main>
      <section class="intro" aria-labelledby="publication-title">
        <p class="kicker">Standalone reader / <span>demo library</span></p>
        <h1 id="publication-title"></h1>
        <p class="description" id="publication-description"></p>
        <p class="creator" id="publication-creator"></p>
      </section>

      <nav class="fixture-library" aria-label="Demo library">
        <div class="library-heading"><span>Try a publication</span><span>2 fixtures</span></div>
        <div class="fixture-list">
          <button class="fixture-card" data-fixture="images" type="button">
            <span class="fixture-mark fixture-mark--zine" aria-hidden="true">01</span>
            <span><strong>Small fixture zine</strong><small>Six ordered image pages</small></span>
          </button>
          <button class="fixture-card fixture-card--secondary" data-fixture="pdf" type="button">
            <span class="fixture-mark fixture-mark--pdf" aria-hidden="true">!</span>
            <span><strong>Incompatible PDF</strong><small>Failure and fallback path</small></span>
          </button>
        </div>
      </nav>

      <section class="reader" aria-label="Publication reader">
        <div class="reader-status" role="status" aria-live="polite"></div>
        <div class="reader-toolbar" hidden>
          <div class="mode-switch" aria-label="Reading mode">
            <button data-mode="page-turn" type="button">Page turn</button>
            <button data-mode="slide" type="button">Slide</button>
          </div>
          <div class="page-count"><span data-page-label>Page 1 of 1</span><progress data-progress max="1" value="0"></progress></div>
        </div>
        <div class="stage" tabindex="-1" aria-label="Publication page"></div>
        <div class="reader-controls" hidden>
          <button class="icon-button" data-action="previous" type="button" aria-label="Previous page">← <span>Previous</span></button>
          <button class="icon-button" data-action="next" type="button" aria-label="Next page"><span>Next</span> →</button>
        </div>
        <p class="reading-note" hidden>Reading derivatives are shown here; the publication original stays untouched.</p>
      </section>
    </main>
    <footer class="footer-note">Use <kbd>←</kbd> <kbd>→</kbd> to turn pages <span aria-hidden="true">·</span> <kbd>Esc</kbd> to focus the canvas</footer>
  </div>`;

const title = app.querySelector<HTMLHeadingElement>('#publication-title')!;
const description = app.querySelector<HTMLParagraphElement>('#publication-description')!;
const creator = app.querySelector<HTMLParagraphElement>('#publication-creator')!;
const status = app.querySelector<HTMLDivElement>('.reader-status')!;
const toolbar = app.querySelector<HTMLElement>('.reader-toolbar')!;
const controls = app.querySelector<HTMLElement>('.reader-controls')!;
const pageLabel = app.querySelector<HTMLSpanElement>('[data-page-label]')!;
const progress = app.querySelector<HTMLProgressElement>('[data-progress]')!;
const stage = app.querySelector<HTMLDivElement>('.stage')!;
const readingNote = app.querySelector<HTMLParagraphElement>('.reading-note')!;
if (!title || !description || !creator || !status || !toolbar || !controls || !pageLabel || !progress || !stage || !readingNote) {
  throw new Error('Missing reader demo elements.');
}

function statusMessage(state: ReaderStatus): string {
  if (state.status === 'loading') return 'Preparing the reading room…';
  if (state.status === 'ready') return `${state.mode === 'page-turn' ? 'Page-turn' : 'Slide'} mode`;
  if (state.status === 'failure' || state.status === 'page-failure') return state.message;
  return state.reason ?? 'The standard viewer is ready.';
}

function renderSurface(state: Extract<ReaderStatus, { status: 'ready' }>) {
  const options = {
    pageCount: state.pageCount,
    currentPage: state.currentPage,
    wideViewport: window.matchMedia('(min-width: 760px)').matches,
    onPageChange: (page: number) => reader.goTo(page),
    onRequestPage: (page: number) => reader.preparePage(page),
  };

  if (state.mode === 'page-turn') {
    if (!pageTurnMounted || renderedMode !== 'page-turn') {
      pageTurnRenderer.destroy();
      stage.replaceChildren();
      pageTurnRenderer.mount(stage, state.pages, options);
      pageTurnMounted = true;
    } else {
      pageTurnRenderer.update(state.pages, options);
    }
  } else {
    if (pageTurnMounted) {
      pageTurnRenderer.destroy();
      pageTurnMounted = false;
    }
    const page = state.pages.find((candidate) => candidate.index === state.currentPage);
    stage.replaceChildren();
    if (page) {
      const image = document.createElement('img');
      image.src = page.url;
      image.alt = page.alt ?? `Publication page ${page.index + 1}`;
      stage.append(image);
    }
  }
  renderedMode = state.mode;
}

function render(state: ReaderStatus) {
  title.textContent = state.metadata.title;
  description.textContent = state.metadata.description ?? 'A framework-independent visual publication boundary.';
  creator.textContent = state.metadata.creator ?? '';
  creator.hidden = !state.metadata.creator;
  status.textContent = statusMessage(state);
  app.querySelectorAll<HTMLButtonElement>('[data-fixture]').forEach((button) => {
    button.setAttribute('aria-current', button.dataset.fixture === (input === imageFixture ? 'images' : 'pdf') ? 'true' : 'false');
  });

  if (state.status === 'ready' || state.status === 'page-failure') {
    const pageCount = state.pageCount;
    const currentPage = state.currentPage;
    toolbar.hidden = false;
    controls.hidden = false;
    readingNote.hidden = false;
    pageLabel.textContent = `Page ${currentPage + 1} of ${pageCount}`;
    progress.max = pageCount;
    progress.value = currentPage + 1;
    app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.mode === state.mode ? 'true' : 'false');
    });
    const previous = app.querySelector<HTMLButtonElement>('[data-action="previous"]');
    const next = app.querySelector<HTMLButtonElement>('[data-action="next"]');
    if (previous) previous.disabled = currentPage === 0;
    if (next) next.disabled = currentPage === pageCount - 1;
    renderSurface(state.status === 'ready' ? state : { ...state, status: 'ready', pages: state.pages, loadedPages: state.pages.map((page) => page.index), representation: 'reading-derivative' });
    if (state.status === 'page-failure') renderFailure(state.message, state.fallback.label ?? 'Open standard viewer');
    return;
  }

  toolbar.hidden = true;
  controls.hidden = true;
  readingNote.hidden = true;
  if (pageTurnMounted) {
    pageTurnRenderer.destroy();
    pageTurnMounted = false;
  }
  renderedMode = undefined;
  if (state.status === 'loading') {
    stage.innerHTML = '<div class="state-panel"><span class="loader" aria-hidden="true"></span><strong>Opening the publication</strong><span>Getting the first page ready.</span></div>';
  } else if (state.status === 'failure') {
    renderFailure(state.message, state.fallback.label ?? 'Open standard viewer');
  } else {
    stage.innerHTML = `<div class="state-panel"><strong>Standard viewer selected</strong><span>${state.reason ?? 'This publication is best viewed in its original format.'}</span><button data-action="fallback" type="button">${state.fallback.label ?? 'Open standard viewer'}</button></div>`;
    bindFallback();
  }
}

function renderFailure(message: string, fallbackLabel: string) {
  stage.innerHTML = `<div class="state-panel state-panel--failure"><span class="failure-mark" aria-hidden="true">×</span><strong>Reader unavailable</strong><span>${message}</span><button data-action="fallback" type="button">${fallbackLabel}</button></div>`;
  bindFallback();
}

function bindFallback() {
  app.querySelector<HTMLButtonElement>('[data-action="fallback"]')?.addEventListener('click', () => {
    reader.useFallback();
    const fallback = reader.getState();
    if (fallback.status === 'fallback') window.open(fallback.fallback.url, '_blank', 'noopener,noreferrer');
  });
}

app.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const action = target.closest<HTMLButtonElement>('[data-action]')?.dataset.action;
  const mode = target.closest<HTMLButtonElement>('[data-mode]')?.dataset.mode as ReaderMode | undefined;
  const fixture = target.closest<HTMLButtonElement>('[data-fixture]')?.dataset.fixture;
  if (action === 'previous') pageTurnMounted && input.configuration.mode === 'page-turn' ? pageTurnRenderer.previous() : reader.previous();
  if (action === 'next') pageTurnMounted && input.configuration.mode === 'page-turn' ? pageTurnRenderer.next() : reader.next();
  if (mode) reader.setMode(mode);
  if (fixture) {
    input = fixture === 'pdf' ? incompatiblePdfFixture : imageFixture;
    void start();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); pageTurnMounted ? pageTurnRenderer.previous() : reader.previous(); }
  if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); pageTurnMounted ? pageTurnRenderer.next() : reader.next(); }
  if (event.key === 'Home') { event.preventDefault(); reader.goTo(0); }
  if (event.key === 'End') { event.preventDefault(); const state = reader.getState(); if (state.status === 'ready') reader.goTo(state.pageCount - 1); }
  if (event.key === 'Escape') stage.focus();
});

window.addEventListener('resize', () => {
  const state = reader?.getState();
  if (state?.status === 'ready' && state.mode === 'page-turn') renderSurface(state);
});

async function start() {
  pageTurnRenderer.destroy();
  pageTurnMounted = false;
  renderedMode = undefined;
  reader?.destroy();
  reader = createReader(input, {
    'ordered-images': imagePagesLoader,
    'direct-pdf': createPdfLoader(pdfjs),
    pageSurface: imagePageSurface(),
  });
  reader.subscribe(render);
  render(reader.getState());
  await reader.load();
}

void start();
