export type PageMigrationZine = {
  active_page_generation: string | null;
  id: number;
  import_status: string | null;
  is_published: boolean | null;
  pdf_url: string | null;
  processed_pdf_url: string | null;
  title: string;
  total_pages: number | null;
};

export function selectPageMigrationCandidates(
  zines: PageMigrationZine[],
  excludedIds: ReadonlySet<number>,
): PageMigrationZine[] {
  return zines.filter((zine) => {
    if (!zine.is_published || !zine.pdf_url || excludedIds.has(zine.id)) return false;
    const complete = zine.import_status === 'completed'
      && zine.processed_pdf_url === zine.pdf_url
      && Boolean(zine.active_page_generation && zine.active_page_generation !== 'legacy')
      && Boolean(zine.total_pages && zine.total_pages > 0);
    return !complete;
  });
}
