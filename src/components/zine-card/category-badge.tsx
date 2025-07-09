interface CategoryBadgeProps {
  categories: string[];
  onCategoryClick?: (category: string) => void;
}

export default function CategoryBadge({ categories, onCategoryClick }: CategoryBadgeProps) {
  return (
    <div className="flex flex-wrap gap-1 justify-center mt-2">
      {categories.map((category, index) => {
        const Element = onCategoryClick ? 'button' : 'span';
        
        return (
          <Element
            key={index}
            className={`inline-block px-2 py-1 text-xs bg-neutral-200 text-neutral-800 rounded-md ${
              onCategoryClick 
                ? 'hover:bg-neutral-300 hover:text-neutral-900 cursor-pointer transition-colors duration-200' 
                : ''
            }`}
            onClick={onCategoryClick ? () => onCategoryClick(category) : undefined}
            type={onCategoryClick ? 'button' : undefined}
            title={onCategoryClick ? `Filtrar por "${category}"` : undefined}
          >
            {category}
          </Element>
        );
      })}
    </div>
  );
}
