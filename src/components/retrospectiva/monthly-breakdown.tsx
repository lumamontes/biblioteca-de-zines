import { MonthlyData } from "@/services/statistics-service";

interface MonthlyBreakdownProps {
  title: string;
  data: MonthlyData[];
  showChart?: boolean;
}

export function MonthlyBreakdown({
  title,
  data,
  showChart = true,
}: MonthlyBreakdownProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white border-2 border-black p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((month) => (
          <div key={month.month} className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium">{month.monthName}</div>
            {showChart && (
              <div className="flex-1 bg-gray-200 h-6 border border-gray-300 relative">
                <div
                  className="bg-zine-green h-full border-r-2 border-black"
                  style={{ width: `${(month.count / maxCount) * 100}%` }}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-black">
                  {month.count}
                </span>
              </div>
            )}
            {!showChart && (
              <div className="flex-1 text-right font-bold">{month.count}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


