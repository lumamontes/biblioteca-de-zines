import { PageFlip } from 'page-flip';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import './style.css';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const defaultPdfUrl =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

function must<T extends Element>(element: T | null, name: string): T {
  if (!element) throw new Error(`Missing ${name}`);
  return element;
}

const app = must(document.querySelector<HTMLDivElement>('#app'), 'application root');

app.innerHTML = `
  <section class="shell">
    <header>
      <p class="eyebrow">Feasibility spike</p>
      <h1>Visual publication reader</h1>
      <p class="lede">Compare direct PDF rendering, image pages, slide navigation, and page-turn interaction.</p>
    </header>
    <form class="source-form" id="source-form">
      <label>
        External PDF URL
        <input id="pdf-url" name="pdf-url" type="url" value="${defaultPdfUrl}" required />
      </label>
      <button type="submit">Load PDF</button>
      <button id="load-image-fixture" type="button">Load image fixture</button>
    </form>
    <div class="toolbar" aria-label="Reader controls">
      <button id="slide-mode" type="button">Slide mode</button>
      <button id="page-turn-mode" type="button">Page-turn mode</button>
      <button id="previous-page" type="button" aria-label="Previous page">Previous</button>
      <button id="next-page" type="button" aria-label="Next page">Next</button>
      <output id="page-status">No publication loaded</output>
    </div>
    <p class="status" id="status" role="status">Ready to load a PDF.</p>
    <div class="reader-stage" id="reader-stage"></div>
    <details>
      <summary>Spike notes</summary>
      <ul>
        <li>PDF.js is used as a page renderer, not as the generic viewer.</li>
        <li>Only visible and adjacent pages are rendered into canvases.</li>
        <li>Page-flip receives HTML page surfaces so the PDF source remains replaceable.</li>
        <li>Use browser devtools to inspect network range requests and memory while navigating.</li>
      </ul>
    </details>
  </section>
`;

const form = must(document.querySelector<HTMLFormElement>('#source-form'), 'source form');
const status = must(document.querySelector<HTMLParagraphElement>('#status'), 'status');
const pageStatus = must(document.querySelector<HTMLOutputElement>('#page-status'), 'page status');
const stage = must(document.querySelector<HTMLDivElement>('#reader-stage'), 'reader stage');
const previousButton = must(document.querySelector<HTMLButtonElement>('#previous-page'), 'previous button');
const nextButton = must(document.querySelector<HTMLButtonElement>('#next-page'), 'next button');
const slideButton = must(document.querySelector<HTMLButtonElement>('#slide-mode'), 'slide button');
const pageTurnButton = must(document.querySelector<HTMLButtonElement>('#page-turn-mode'), 'page-turn button');
const imageFixtureButton = must(document.querySelector<HTMLButtonElement>('#load-image-fixture'), 'image fixture button');

let documentProxy: PDFDocumentProxy | undefined;
let pageFlip: PageFlip | undefined;
let pageFlipMount: HTMLDivElement | undefined;
let pages: HTMLDivElement[] = [];
let currentPage = 0;
let mode: 'slide' | 'page-turn' = 'page-turn';
let renderGeneration = 0;

function setStatus(message: string, error = false) {
  status.textContent = message;
  status.dataset.error = String(error);
}

function updatePageStatus() {
  const count = documentProxy?.numPages ?? pages.length;
  pageStatus.value = count ? `Page ${currentPage + 1} of ${count}` : 'No publication loaded';
  previousButton.disabled = currentPage <= 0;
  nextButton.disabled = !count || currentPage >= count - 1;
}

function clearReader() {
  renderGeneration += 1;
  documentProxy?.destroy();
  documentProxy = undefined;
  pageFlip?.destroy();
  pageFlip = undefined;
  pageFlipMount = undefined;
  pages = [];
  stage.replaceChildren();
  currentPage = 0;
  updatePageStatus();
}

function createPageElement(index: number) {
  const page = document.createElement('div');
  page.className = 'page';
  page.dataset.pageIndex = String(index);
  page.dataset.density = index === 0 ? 'hard' : 'soft';
  page.innerHTML = `<canvas aria-label="Publication page ${index + 1}"></canvas><span class="page-placeholder">Page ${index + 1}</span>`;
  return page;
}

function createImageFixturePage(index: number) {
  const page = document.createElement('div');
  page.className = 'page';
  page.dataset.pageIndex = String(index);
  page.dataset.density = index === 0 || index === 5 ? 'hard' : 'soft';
  const background = index % 2 === 0 ? '#f3b562' : '#b9d6c2';
  const foreground = index % 2 === 0 ? '#2c2117' : '#18241f';
  const image = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="840" viewBox="0 0 600 840">
      <rect width="600" height="840" fill="${background}"/>
      <circle cx="470" cy="170" r="110" fill="${foreground}" opacity=".16"/>
      <path d="M80 650 C180 430 300 730 520 360" fill="none" stroke="${foreground}" stroke-width="24"/>
      <text x="70" y="110" fill="${foreground}" font-family="Georgia" font-size="32">Image fixture</text>
      <text x="70" y="760" fill="${foreground}" font-family="system-ui" font-size="24">Page ${index + 1}</text>
    </svg>
  `)}`;
  page.innerHTML = `<img src="${image}" alt="Image fixture page ${index + 1}" />`;
  return page;
}

async function renderPage(index: number, generation: number) {
  if (!documentProxy || generation !== renderGeneration || !pages[index]) return;

  const page = await documentProxy.getPage(index + 1);
  if (generation !== renderGeneration) return;

  const canvas = pages[index].querySelector<HTMLCanvasElement>('canvas');
  const placeholder = pages[index].querySelector<HTMLSpanElement>('.page-placeholder');
  if (!canvas) return;

  const baseViewport = page.getViewport({ scale: 1 });
  const maxWidth = Math.max(240, Math.min(700, stage.clientWidth / (window.innerWidth >= 900 ? 2 : 1)));
  const scale = maxWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });
  const deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(viewport.width * deviceScale);
  canvas.height = Math.ceil(viewport.height * deviceScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  await page.render({
    canvas,
    canvasContext: canvas.getContext('2d')!,
    viewport,
    transform: deviceScale === 1 ? undefined : [deviceScale, 0, 0, deviceScale, 0, 0],
  }).promise;

  if (placeholder) placeholder.remove();
  page.cleanup();
}

function renderAround(index: number) {
  const generation = renderGeneration;
  const candidates = [index - 1, index, index + 1].filter(
    (candidate) => candidate >= 0 && candidate < pages.length,
  );
  void Promise.all(candidates.map((candidate) => renderPage(candidate, generation)));
}

function updateModeButtons() {
  slideButton.dataset.active = String(mode === 'slide');
  pageTurnButton.dataset.active = String(mode === 'page-turn');
  stage.dataset.mode = mode;
}

function setMode(nextMode: 'slide' | 'page-turn') {
  mode = nextMode;
  updateModeButtons();
  if (documentProxy) renderPublication();
}

function showSlide(index: number, animate = true) {
  currentPage = Math.max(0, Math.min(index, pages.length - 1));
  pages.forEach((page, pageIndex) => {
    page.hidden = pageIndex !== currentPage;
  });
  stage.classList.toggle('animate-slide', animate);
  renderAround(currentPage);
  updatePageStatus();
}

function showPageTurn() {
  pageFlipMount = document.createElement('div');
  pageFlipMount.className = 'page-flip-mount';
  pageFlipMount.append(...pages);
  stage.append(pageFlipMount);

  pageFlip = new PageFlip(pageFlipMount, {
    width: 520,
    height: 720,
    size: 'stretch',
    minWidth: 280,
    maxWidth: 520,
    minHeight: 390,
    maxHeight: 720,
    showCover: true,
    drawShadow: true,
    flippingTime: 850,
    mobileScrollSupport: true,
  });
  pageFlip.loadFromHTML(pages);
  pageFlip.on('flip', () => {
    currentPage = pageFlip?.getCurrentPageIndex() ?? currentPage;
    renderAround(currentPage);
    updatePageStatus();
  });
  renderAround(currentPage);
  updatePageStatus();
}

function renderPublication() {
  if (!documentProxy && pages.length === 0) return;
  pageFlip?.destroy();
  pageFlip = undefined;
  pageFlipMount = undefined;
  stage.replaceChildren();
  updateModeButtons();

  if (mode === 'slide') {
    stage.append(...pages);
    showSlide(currentPage, false);
  }
  else showPageTurn();
}

async function loadPdf(url: string) {
  clearReader();
  setStatus('Loading PDF metadata...');
  const startedAt = performance.now();

  try {
    documentProxy = await getDocument({ url, disableAutoFetch: false }).promise;
    pages = Array.from({ length: documentProxy.numPages }, (_, index) => createPageElement(index));
    stage.replaceChildren(...pages);
    renderPublication();
    const elapsed = Math.round(performance.now() - startedAt);
    setStatus(`Loaded ${documentProxy.numPages} pages in ${elapsed} ms. Render visible and adjacent pages while navigating.`);
  } catch (error) {
    clearReader();
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Custom reader failed: ${message}. Open the standard viewer instead.`, true);
  }
}

function loadImageFixture() {
  clearReader();
  pages = Array.from({ length: 6 }, (_, index) => createImageFixturePage(index));
  currentPage = 0;
  renderPublication();
  setStatus('Loaded 6 image pages. Compare image surfaces with the PDF path.');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = new FormData(form).get('pdf-url');
  if (typeof url === 'string' && url) void loadPdf(url);
});

previousButton.addEventListener('click', () => {
  if (mode === 'slide') showSlide(currentPage - 1);
  else pageFlip?.flipPrev('top');
});

nextButton.addEventListener('click', () => {
  if (mode === 'slide') showSlide(currentPage + 1);
  else pageFlip?.flipNext('top');
});

slideButton.addEventListener('click', () => setMode('slide'));
pageTurnButton.addEventListener('click', () => setMode('page-turn'));
imageFixtureButton.addEventListener('click', loadImageFixture);
updateModeButtons();
updatePageStatus();
