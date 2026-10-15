"use client";

import { useCallback } from "react";
import { Zine } from "@/@types/zine";
import { Tables } from "@/types/database.types";
import { useZineFilters } from "@/hooks/use-zine-filters";
import { FilterButton } from "./filter-button";
import { SearchInput } from "./search-input";
import { FiltersGrid } from "./filters-grid";
import { ZineGrid } from "./zine-grid";
import { Pagination } from "./pagination";
import { QuantitySelector } from "./quantity-selector";

interface FilteredZinesProps {
  initialZines: Zine[];
  initialTotalCount: number;
  categories: Tables<"categories">[];
}

export default function FilteredZines({ initialZines, initialTotalCount, categories }: FilteredZinesProps) {
  const {
    paginatedZines,
    filters,
    loading,
    hasActiveFilters,
    availableYears,
    totalPages,
    updateFilter,
    clearAllFilters,
  } = useZineFilters(initialZines, initialTotalCount);

  const handleCategoryClick = useCallback((category: string) => {
    if (!filters.categories.includes(category)) {
      updateFilter('categories', [...filters.categories, category]);
    }
  }, [filters.categories, updateFilter]);

  return (
    <div className="space-y-6  mx-4">
      <section aria-labelledby="sort-heading">
        <div className="flex flex-col sm:flex-row gap-4">
          <FilterButton
            isActive={filters.orderBy === "recent"}
            onClick={() => updateFilter('orderBy', "recent")}
            aria-label="Ordenar por mais recentes"
          >
            Mais recentes
          </FilterButton>

          <FilterButton
            isActive={filters.orderBy === "all"}
            onClick={() => updateFilter('orderBy', "all")}
            aria-label="Mostrar todos os zines"
          >
            Todas
          </FilterButton>
        </div>
      </section>

      {/* Search and Filters */}
      <section aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">
          Filtros de busca
        </h2>
        <div className="space-y-4">
          <SearchInput
            onSearch={(search) => updateFilter('search', search)}
            defaultValue={filters.search}
          />

          <FiltersGrid
            availableYears={availableYears}
            selectedYears={filters.publishedYears}
            onYearsChange={(years) => updateFilter('publishedYears', years)}
            categories={categories}
            selectedCategories={filters.categories}
            onCategoriesChange={(categories) => updateFilter('categories', categories)}
          />

          {hasActiveFilters && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm underline decoration-2 underline-offset-2 transition-colors duration-200"
                aria-label="Limpar todos os filtros aplicados"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">
          Resultados da busca
        </h2>
        
       
        <ZineGrid
          zines={paginatedZines}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
          onCategoryClick={handleCategoryClick}
        />
        <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-4">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <QuantitySelector
            value={filters.limit}
            onChange={(limit) => updateFilter('limit', limit)}
          />
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(page) => updateFilter('page', page)}
          />
        )}
        </div>
      </section>
    </div>
  );
}
