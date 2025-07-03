"use client";

import { useState, useEffect } from "react";
import ZineCard from "@/components/zine-card/zine-card";
import { searchZines } from "@/services/zine-service";
import { debounce } from "lodash";
import { Zine } from "@/@types/zine";
import ZineCardSkeleton from "../zine-card/zine-card.skeleton";
import MultiSelect from "../ui/multi-select";
import { Tables } from "@/types/database.types";
import { getCategories } from "@/services/categories-service";

export default function FilteredZines({
  initialZines,
}: {
  initialZines: Zine[];
}) {
  const [zines, setZines] = useState(initialZines);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [publishedYears, setPublishedYears] = useState<Set<number>>(new Set());
  const [selectedPublishedYears, setSelectedPublishedYears] = useState<string[]>([]);

  const extractPublishedYears = (zines: Zine[]) => {
    const years = zines
      .map(({ year }) => year)
      .filter((year): year is number => year !== null);
    return new Set(years);
  };

  useEffect(() => {
    setPublishedYears(extractPublishedYears(initialZines));
  }, [initialZines]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categories = await getCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchZines = async () => {
      try {
        setLoading(true);
        const filteredZines = await searchZines({
          search: searchQuery || null,
          orderBy: filter,
          categories: selectedCategories,
        });
        
        const finalZines = selectedPublishedYears.length > 0
          ? filteredZines.filter(zine => 
              zine.year && selectedPublishedYears.includes(zine.year.toString())
            )
          : filteredZines;

        setZines(finalZines);
        setPublishedYears(extractPublishedYears(filteredZines));
      } catch (error) {
        console.error("Error fetching zines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchZines();
  }, [searchQuery, filter, selectedCategories, selectedPublishedYears]);

  const handleSearch = debounce((searchQuery: string) => {
    setSearchQuery(searchQuery);
  }, 600);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPublishedYears([]);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedPublishedYears.length > 0;

  const renderZines = () => {
    if (loading) {
      return [...Array(6)].map((_, index) => <ZineCardSkeleton key={index} />);
    }
    
    if (zines.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p role="status" className="text-gray-500 text-lg">
            Nenhum zine encontrado.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      );
    }
    
    return zines.map((zine) => <ZineCard zine={zine} key={zine.uuid} />);
  };

  const renderMultiSelectSkeleton = () => (
    <div className="w-full max-w-sm h-10 bg-gray-200 rounded-md animate-pulse"></div>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
            filter === "recent"
              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
          }`}
          onClick={() => setFilter("recent")}
        >
          Mais recentes
        </button>

        <button
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
          }`}
          onClick={() => setFilter("all")}
        >
          Todas
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="w-full">
          <input
            type="text"
            placeholder="Buscar zine ou autor"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            onChange={(event) => handleSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            {publishedYears.size > 0 ? (
              <MultiSelect
                key={`years-${publishedYears.size}`}
                options={Array.from(publishedYears)
                  .sort((a, b) => b - a)
                  .map((year: number) => ({
                    id: year,
                    name: year.toString()
                  }))}
                selectedValues={selectedPublishedYears}
                onChange={setSelectedPublishedYears}
                placeholder="Ano"
              />
            ) : (
              renderMultiSelectSkeleton()
            )}
          </div>

          <div className="w-full sm:w-auto sm:min-w-[200px]">
            {loadingCategories ? (
              renderMultiSelectSkeleton()
            ) : (
              <MultiSelect
                key={`categories-${categories.length}`}
                options={categories}
                selectedValues={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Categorias"
              />
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-start">
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      <div
        role="grid"
        className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {renderZines()}
      </div>
    </div>
  );
}
