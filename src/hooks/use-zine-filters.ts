import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { debounce } from 'lodash';
import { searchZines } from '@/services/zine-service';
import { Zine } from '@/@types/zine';

export interface ZineFilters {
  search: string;
  categories: string[];
  publishedYears: string[];
  orderBy: 'recent' | 'all';
}

export interface UseZineFiltersReturn {
  zines: Zine[];
  filters: ZineFilters;
  loading: boolean;
  hasActiveFilters: boolean;
  availableYears: number[];
  updateFilter: (key: keyof ZineFilters, value: string | string[]) => void;
  clearAllFilters: () => void;
}

const SEARCH_DEBOUNCE_MS = 600;

export function useZineFilters(
  initialZines: Zine[],
): UseZineFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialFilters: ZineFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    categories: searchParams.getAll('category'),
    publishedYears: searchParams.getAll('year'),
    orderBy: (searchParams.get('orderBy') as 'recent' | 'all') || 'recent'
  }), [searchParams]);

  const [filters, setFilters] = useState<ZineFilters>(initialFilters);
  const [zines, setZines] = useState<Zine[]>(initialZines);
  const [loading, setLoading] = useState(false);

  const availableYears = useMemo(() => {
    const years = initialZines
      .map(zine => zine.year)
      .filter((year): year is number => year !== null);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [initialZines]);

  const hasActiveFilters = useMemo(() => 
    filters.search.length > 0 || 
    filters.categories.length > 0 || 
    filters.publishedYears.length > 0,
    [filters]
  );

  const updateURL = useCallback((newFilters: ZineFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.orderBy !== 'recent') params.set('orderBy', newFilters.orderBy);
    
    newFilters.categories.forEach(category => params.append('category', category));
    newFilters.publishedYears.forEach(year => params.append('year', year));

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [router, pathname]);

  const debouncedSearch = useMemo(
    () => debounce(async (newFilters: ZineFilters) => {
      try {
        setLoading(true);
        const filteredZines = await searchZines({
          search: newFilters.search || null,
          orderBy: newFilters.orderBy,
          categories: newFilters.categories,
        });
        
        const finalZines = newFilters.publishedYears.length > 0
          ? filteredZines.filter(zine => 
              zine.year && newFilters.publishedYears.includes(zine.year.toString())
            )
          : filteredZines;

        setZines(finalZines);
      } catch (error) {
        console.error('Error fetching zines:', error);
        // Could add error state here
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    debouncedSearch(filters);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [filters, debouncedSearch]);

  useEffect(() => {
    updateURL(filters);
  }, [filters, updateURL]);

  const updateFilter = useCallback((key: keyof ZineFilters, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: ZineFilters = {
      search: '',
      categories: [],
      publishedYears: [],
      orderBy: 'recent'
    };
    setFilters(clearedFilters);
  }, []);

  return {
    zines,
    filters,
    loading,
    hasActiveFilters,
    availableYears,
    updateFilter,
    clearAllFilters
  };
}
