import { TopCategory } from "@/services/statistics-service";

interface TopCategoriesProps {
  categories: TopCategory[];
}

export function TopCategories({ categories }: TopCategoriesProps) {
  return (
    <div className="bg-white border-2 border-black p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">Categorias Mais Populares</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            key={category.category}
            className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black w-8 text-center">
                {index + 1}
              </span>
              <span className="font-medium capitalize">{category.category}</span>
            </div>
            <span className="font-bold text-zine-yellow">
              {category.count} zine{category.count !== 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


