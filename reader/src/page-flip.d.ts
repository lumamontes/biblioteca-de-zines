declare module 'page-flip' {
  export type PageFlipEvent = { data: number | string | boolean | object };

  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>);
    loadFromHTML(items: HTMLElement[]): void;
    updateFromHtml(items: HTMLElement[]): void;
    on(event: 'flip' | 'changeState', handler: (event: PageFlipEvent) => void): void;
    turnToPage(page: number): void;
    flipNext(corner: 'top' | 'bottom'): void;
    flipPrev(corner: 'top' | 'bottom'): void;
    flip(page: number, corner: 'top' | 'bottom'): void;
    getCurrentPageIndex(): number;
    destroy(): void;
  }
}
