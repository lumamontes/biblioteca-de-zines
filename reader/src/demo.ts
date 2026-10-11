import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createPdfLoader } from './pdf';
import { createPageTurnRenderer } from './page-turn';
import { createReader, imagePagesLoader } from './reader';
import type { ReaderBoundary, ReaderInput, ReaderStatus } from './contract';
import { imageFixture, incompatiblePdfFixture } from './fixtures';
import './demo.css';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing demo root.');
const app: HTMLDivElement = root;

let reader: ReaderBoundary;
let input = imageFixture;
const pageTurnRenderer = createPageTurnRenderer({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
});
let pageTurnMounted = false;

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

function createInput(): ReaderBoundary {
  return createReader(input, {
    'ordered-images': imagePagesLoader,
    'direct-pdf': createPdfLoader(pdfjs),
  });
}

function render(state: ReaderStatus) {
  const ready = state.status === 'ready' ? state : undefined;
  if (pageTurnMounted) {
    pageTurnRenderer.destroy();
    pageTurnMounted = false;
  }
  const page = ready?.pages.find((candidate) => candidate.index === ready.currentPage);
  const controls = ready
    ? `<div class="controls"><button data-action="previous" ${ready.currentPage === 0 ? 'disabled' : ''}>Previous</button><span>Page ${ready.currentPage + 1} of ${ready.pageCount}</span><button data-action="next" ${ready.currentPage === ready.pageCount - 1 ? 'disabled' : ''}>Next</button></div>`
    : '';
  const mode = ready
    ? `<div class="mode"><button data-mode="slide" ${ready.mode === 'slide' ? 'aria-pressed="true"' : ''}>Slide</button><button data-mode="page-turn" ${ready.mode === 'page-turn' ? 'aria-pressed="true"' : ''}>Page turn</button></div>`
    : '';
  const fallbackState = state.status === 'failure' || state.status === 'page-failure' || state.status === 'fallback' ? state : undefined;
  const fallback = fallbackState
    ? `<button data-action="fallback">${fallbackState.fallback.label ?? 'Open standard viewer'}</button>`
    : '';

  app.innerHTML = `<section class="shell"><header><p class="eyebrow">Standalone reader shell</p><h1>${state.metadata.title}</h1><p>${state.metadata.description ?? 'A framework-independent visual publication boundary.'}</p>${state.metadata.creator ? `<p class="creator">${state.metadata.creator}</p>` : ''}</header><nav class="fixtures" aria-label="Demo fixtures"><button data-fixture="images">Image pages</button><button data-fixture="pdf">Incompatible PDF</button></nav><p class="status" role="status">${statusMessage(state)}</p>${mode}${controls}<div class="stage">${page && ready?.mode === 'slide' ? `<img src="${page.url}" alt="${page.alt ?? `Page ${page.index + 1}`}" />` : ready?.mode === 'page-turn' ? '' : '<span class="empty">No page surface</span>'}</div>${ready ? `<small>Image pages are reading derivatives, not the publication original.</small>` : ''}${fallback}</section>`;
  if (ready?.mode === 'page-turn') {
    const stage = app.querySelector<HTMLDivElement>('.stage');
    if (stage) {
      pageTurnRenderer.mount(stage, ready.pages, {
        pageCount: ready.pageCount,
        currentPage: ready.currentPage,
        wideViewport: window.matchMedia('(min-width: 700px)').matches,
        onPageChange: (nextPage) => reader.goTo(nextPage),
      });
      pageTurnMounted = true;
    }
  }
  app.querySelectorAll<HTMLButtonElement>('[data-action="previous"]').forEach((button) => button.addEventListener('click', () => { reader.previous(); }));
  app.querySelectorAll<HTMLButtonElement>('[data-action="next"]').forEach((button) => button.addEventListener('click', () => { reader.next(); }));
  app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => { reader.setMode(button.dataset.mode as 'slide' | 'page-turn'); }));
  app.querySelectorAll<HTMLButtonElement>('[data-action="fallback"]').forEach((button) => button.addEventListener('click', () => window.open(fallbackState?.fallback.url, '_blank', 'noopener,noreferrer')));
  app.querySelectorAll<HTMLButtonElement>('[data-fixture]').forEach((button) => button.addEventListener('click', () => { input = button.dataset.fixture === 'pdf' ? incompatiblePdfFixture : imageFixture; start(); }));
}

function statusMessage(state: ReaderStatus): string {
  if (state.status === 'loading') return 'Loading publication...';
  if (state.status === 'ready') return `${state.mode === 'page-turn' ? 'Page-turn' : 'Slide'} mode ready.`;
  if (state.status === 'failure' || state.status === 'page-failure') return `Custom reader failed: ${state.message}`;
  return `Using standard viewer: ${state.reason ?? 'selected by reader'}`;
}

async function start() {
  if (pageTurnMounted) {
    pageTurnRenderer.destroy();
    pageTurnMounted = false;
  }
  reader?.destroy();
  reader = createInput();
  reader.subscribe(render);
  render(reader.getState());
  await reader.load();
}

void start();
