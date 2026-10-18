import { memo } from 'react';
import MultiSelect from '../ui/multi-select';
import { Tables } from '@/types/database.types';

interface FiltersGridProps {
  availableYears: number[];
  selectedYears: string[];
  onYearsChange: (years: string[]) => void;
  categories: Tables<'categories'>[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const MultiSelectSkeleton = memo(() => (
  <div className="w-full max-w-sm h-12 bg-zine-yellow/20 border-2 border-zine-darkblue border-dashed rounded-lg animate-pulse" />
));

MultiSelectSkeleton.displayName = 'MultiSelectSkeleton';

export const FiltersGrid = memo<FiltersGridProps>(({
  availableYears,
  selectedYears,
  onYearsChange,
  categories,
  selectedCategories,
  onCategoriesChange,
}) => (
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="w-full sm:w-auto sm:min-w-[200px]">
      {availableYears.length > 0 ? (
        <MultiSelect
          key={`years-${availableYears.length}`}
          options={availableYears.map(year => ({
            id: year,
            name: year.toString()
          }))}
          selectedValues={selectedYears}
          onChange={onYearsChange}
          placeholder="Filtrar por ano"
          aria-label="Filtrar zines por ano de publicação"
        />
      ) : (
        <MultiSelectSkeleton />
      )}
    </div>

    <div className="w-full sm:w-auto sm:min-w-[200px]">
        <MultiSelect
          key={`categories-${categories.length}`}
          options={categories}
          selectedValues={selectedCategories}
          onChange={onCategoriesChange}
          placeholder="Filtrar por categorias"
          aria-label="Filtrar zines por categoria"
        />
    </div>
  </div>
));

FiltersGrid.displayName = 'FiltersGrid';
