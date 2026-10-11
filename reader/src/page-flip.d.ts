declare module 'page-flip' {
  export type PageFlipEvent = { data: number | string | boolean | object };

  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>);
    loadFromHTML(items: HTMLElement[]): void;
    updateFromHtml(items: HTMLElement[]): void;
    on(event: 'flip', handler: (event: PageFlipEvent) => void): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    destroy(): void;
  }
}
