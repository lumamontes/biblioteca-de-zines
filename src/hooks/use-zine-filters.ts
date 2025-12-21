import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { debounce } from 'lodash';
import { searchZines } from '@/services/zine-service';
import { Zine } from '@/@types/zine';

export interface ZineFilters {
  search: string;
  categories: string[];
  publishedYears: string[];
  orderBy: 'recent' | 'all';
  page: number;
  limit: number;
}

export interface UseZineFiltersReturn {
  zines: Zine[];
  paginatedZines: Zine[];
  filters: ZineFilters;
  loading: boolean;
  hasActiveFilters: boolean;
  availableYears: number[];
  totalPages: number;
  updateFilter: (key: keyof ZineFilters, value: string | string[] | number) => void;
  clearAllFilters: () => void;
}

const SEARCH_DEBOUNCE_MS = 600;

export function useZineFilters(
  initialZines: Zine[],
  initialTotalCount: number,
): UseZineFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialFilters: ZineFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    categories: searchParams.getAll('category'),
    publishedYears: searchParams.getAll('year'),
    orderBy: (searchParams.get('orderBy') as 'recent' | 'all') || 'recent',
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20
  }), [searchParams]);

  const [filters, setFilters] = useState<ZineFilters>(initialFilters);
  const [zines, setZines] = useState<Zine[]>(initialZines);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [loading, setLoading] = useState(false);
  
  const shouldFetchInitially = useMemo(() => {
    const hasFilters = initialFilters.search || 
                      initialFilters.categories.length > 0 || 
                      initialFilters.publishedYears.length > 0 ||
                      initialFilters.orderBy !== 'recent';
    const needsData = initialZines.length < (initialFilters.page * initialFilters.limit);
    return hasFilters || needsData;
  }, [initialFilters, initialZines.length]);
  
  const hasFetchedRef = useRef(!shouldFetchInitially);

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
    
    if (newFilters.page > 1) params.set('page', newFilters.page.toString());
    if (newFilters.limit !== 20) params.set('limit', newFilters.limit.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [router, pathname]);

  const performSearch = useCallback(async (newFilters: ZineFilters) => {
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
      setTotalCount(finalZines.length);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching zines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(performSearch, SEARCH_DEBOUNCE_MS),
    [performSearch]
  );

  const totalPages = useMemo(() => {
    const count = hasActiveFilters ? zines.length : totalCount;
    return Math.ceil(count / filters.limit) || 1;
  }, [zines.length, totalCount, filters.limit, hasActiveFilters]);

  const paginatedZines = useMemo(() => {
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const pageZines = zines.slice(startIndex, endIndex);
    
    if (loading && pageZines.length === 0) {
      return [];
    }
    
    return pageZines;
  }, [zines, filters.page, filters.limit, loading]);

  useEffect(() => {
    if (shouldFetchInitially && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      debouncedSearch(initialFilters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = useCallback((key: keyof ZineFilters, value: string | string[] | number) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      if (key !== 'page' && key !== 'limit' && prev.page !== 1) {
        newFilters.page = 1;
      }
      
      const isFilterChange = key === 'search' || key === 'categories' || 
                            key === 'publishedYears' || key === 'orderBy';
      const isPaginationChange = (key === 'page' || key === 'limit');
      const needsMoreData = isPaginationChange && 
                           zines.length < (newFilters.page * newFilters.limit);
      
      updateURL(newFilters);
      
      if (isFilterChange || needsMoreData) {
        if (needsMoreData) {
          setLoading(true);
        }
        debouncedSearch(newFilters);
      }
      
      return newFilters;
    });
  }, [zines.length, debouncedSearch, updateURL]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: ZineFilters = {
      search: '',
      categories: [],
      publishedYears: [],
      orderBy: 'recent',
      page: 1,
      limit: 20
    };
    updateURL(clearedFilters);
    setFilters(clearedFilters);
    setZines(initialZines);
    setTotalCount(initialTotalCount);
    hasFetchedRef.current = false;
  }, [initialZines, initialTotalCount, updateURL]);

  return {
    zines,
    paginatedZines,
    filters,
    loading,
    hasActiveFilters,
    availableYears,
    totalPages,
    updateFilter,
    clearAllFilters
  };
}
