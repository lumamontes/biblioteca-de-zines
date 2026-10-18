"use client";

import { memo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = memo<PaginationProps>(({ currentPage, totalPages, onPageChange }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault();
    onPageChange(page);
  };

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-2 py-6">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          onClick={(e) => handlePageClick(e, currentPage - 1)}
          className="px-3 py-1.5 text-sm font-medium border border-black rounded-md hover:bg-neutral-100 transition-colors"
          aria-label="Página anterior"
        >
          Anterior
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-400 cursor-not-allowed">
          Anterior
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-sm">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              onClick={(e) => handlePageClick(e, pageNum)}
              className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
                isActive
                  ? 'bg-black text-white border-black'
                  : 'border-black hover:bg-neutral-100'
              }`}
              aria-label={`Ir para página ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          onClick={(e) => handlePageClick(e, currentPage + 1)}
          className="px-3 py-1.5 text-sm font-medium border border-black rounded-md hover:bg-neutral-100 transition-colors"
          aria-label="Próxima página"
        >
          Próxima
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-400 cursor-not-allowed">
          Próxima
        </span>
      )}
    </nav>
  );
});

Pagination.displayName = 'Pagination';

