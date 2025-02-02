"use client";

import { useState, useEffect } from "react";
import ZineCard from "@/components/zine-card";
import { searchZines } from "@/services/zine-service";
import { debounce } from "lodash";
import { Zine } from "@/@types/zine";

export default function FilteredZines({
  initialZines,
}: {
  initialZines: Zine[];
}) {
  const [zines, setZines] = useState(initialZines);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZines = async () => {
      setLoading(true);
      console.log("searchQuery", searchQuery);
      const zines = await searchZines({
        search: searchQuery ?? null,
        orderBy: filter,
      });
      setZines(zines);
      setLoading(false);
    };

    fetchZines();
  }, [searchQuery, filter]);

  const handleSearch = debounce((searchQuery: string) => {
    setSearchQuery(searchQuery);
  }, 600);

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300
      ${
        filter === "all"
          ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
      }`}
          onClick={() => setFilter("all")}
        >
          Todas
        </button>

        <button
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300
      ${
        filter === "recent"
          ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
      }`}
          onClick={() => setFilter("recent")}
        >
          Mais recentes
        </button>
      </div>

      <div className="flex gap-4 mb-4 w-full">
        <input
          type="text"
          placeholder="Buscar zine ou autor"
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 w-full"
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>

      <div
        role="grid"
        className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          <p role="status">Carregando zines...</p>
        ) : zines.length === 0 ? (
          <p role="status">Nenhuma zine encontrada.</p>
        ) : (
          zines.map((zine) => <ZineCard zine={zine} key={zine.uuid} />)
        )}
      </div>
    </div>
  );
}
