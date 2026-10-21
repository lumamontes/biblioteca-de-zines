export type ZineReadingSurface = {
  pdfUrl: string;
  title: string;
  availability: 'available' | 'unavailable';
  beta: {
    embedUrl: string;
    viewerUrl: string;
    pageCount: number;
  } | null;
};

export type AvailableZineReadingSurface = Omit<ZineReadingSurface, 'beta'> & {
  beta: NonNullable<ZineReadingSurface['beta']>;
};
