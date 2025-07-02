export default function CategoryBadge({ categories }: { categories: string[] }) {
  return (<div className="flex flex-wrap gap-1 justify-center mt-2">
  {categories.map((category, index) => (
    <span
      key={index}
      className="inline-block px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-md"
    >
      {category}
    </span>
  ))}
  </div>
);
}
