"use client";

import { useCallback } from "react";
import { Zine } from "@/@types/zine";
import { Tables } from "@/types/database.types";
import { useZineFilters } from "@/hooks/use-zine-filters";
import { FilterButton } from "./filter-button";
import { SearchInput } from "./search-input";
import { FiltersGrid } from "./filters-grid";
import { ZineGrid } from "./zine-grid";

interface FilteredZinesProps {
  initialZines: Zine[];
  categories: Tables<"categories">[];
}

export default function FilteredZines({ initialZines, categories }: FilteredZinesProps) {
  const {
    zines,
    filters,
    loading,
    hasActiveFilters,
    availableYears,
    updateFilter,
    clearAllFilters,
  } = useZineFilters(initialZines, categories);

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
          zines={zines}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
          onCategoryClick={handleCategoryClick}
        />
      </section>
    </div>
  );
}
