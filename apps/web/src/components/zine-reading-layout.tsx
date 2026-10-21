'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { ZineReadingLayoutProps } from './zine-reading-layout-types';

export function ZineReadingLayout({ children, sidebar, sidebarHeader }: ZineReadingLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const gridColumns = sidebarOpen ? 'lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]' : 'lg:grid-cols-[minmax(0,1fr)_auto]';

  return (
    <div className={`grid h-full min-h-0 w-full gap-6 ${gridColumns} lg:items-start`}>
      <div className="min-h-0 min-w-0 lg:h-full">{children}</div>
      {sidebarOpen ? (
        <aside className="reading-sidebar-scroll min-h-0 min-w-0 lg:max-h-full lg:overflow-y-auto">
          <div className="border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
              <div className="min-w-0 flex-1">{sidebarHeader}</div>
              <button
                aria-expanded="true"
                aria-label="Recolher informações da zine"
                className="inline-flex size-9 items-center justify-center border border-black hover:bg-neutral-100"
                onClick={() => setSidebarOpen(false)}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={17} />
              </button>
            </div>
            {sidebar}
          </div>
        </aside>
      ) : (
        <div className="flex justify-start">
          <button
            aria-expanded="false"
            aria-label="Mostrar informações da zine"
            className="inline-flex items-center gap-2 border border-black bg-white px-3 py-2 text-xs font-semibold shadow-sm hover:bg-neutral-100 lg:size-9 lg:justify-center lg:px-0"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={17} />
            <span className="lg:sr-only">Mostrar informações</span>
          </button>
        </div>
      )}
    </div>
  );
}
