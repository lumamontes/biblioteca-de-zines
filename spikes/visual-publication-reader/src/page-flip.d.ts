declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    on(event: 'flip', handler: (event: FlipEvent) => void): void;
    getCurrentPageIndex(): number;
    flipNext(corner: 'top' | 'bottom'): void;
    flipPrev(corner: 'top' | 'bottom'): void;
    destroy(): void;
  }

  type FlipEvent = {
    data: number | string;
  };
}
