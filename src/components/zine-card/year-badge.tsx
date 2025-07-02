export default function YearBadge({ year }: { year: number }) {
  return (
    <div className="inline-block px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-md">
      {year}
    </div>
  );
}