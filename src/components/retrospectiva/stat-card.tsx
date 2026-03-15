interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="bg-white border-2 border-black p-6 shadow-lg transform hover:scale-105 transition-transform">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-4xl font-black text-black mb-1">{value}</p>
      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}


