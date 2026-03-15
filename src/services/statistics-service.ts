import { createClient } from "@/utils/supabase/server";
import { getZineCategories } from "@/utils/utils";
import { Json } from "@/types/database.types";

export interface MonthlyData {
  month: string; // Format: "YYYY-MM"
  count: number;
  monthName: string; // Format: "Janeiro 2024"
}

export interface TopAuthor {
  authorId: number;
  authorName: string;
  zineCount: number;
}

export interface TopCategory {
  category: string;
  count: number;
}

export interface YearData {
  year: number;
  count: number;
}

export interface RetrospectiveStatistics {
  // Total counts
  totalPublishedZines: number;
  totalAuthors: number;
  totalSubmissions: number;
  totalCategoriesUsed: number;

  // Temporal data
  firstZineDate: string | null;
  zinesByMonth: MonthlyData[];
  submissionsByMonth: MonthlyData[];
  zinesByYear: YearData[];
  peakSubmissionDate: string | null;
  peakSubmissionCount: number;

  // Top performers
  topAuthors: TopAuthor[];
  topCategories: TopCategory[];
  mostActiveMonths: MonthlyData[];

  // Growth metrics
  monthlyGrowthRate: number[];
  cumulativeZines: MonthlyData[];
}

function formatMonthName(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getMonthKey(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getRetrospectiveStatistics(): Promise<RetrospectiveStatistics> {
  const supabase = await createClient();

  // Get all published zines
  const { data: zines, error: zinesError } = await supabase
    .from("library_zines")
    .select("*, library_zines_authors(authors(id, name))")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (zinesError) {
    console.error("Error fetching zines:", zinesError);
    throw new Error(zinesError.message);
  }

  // Get all authors
  const { data: authors, error: authorsError } = await supabase
    .from("authors")
    .select("*");

  if (authorsError) {
    console.error("Error fetching authors:", authorsError);
    throw new Error(authorsError.message);
  }

  // Get all submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from("form_uploads")
    .select("*")
    .order("created_at", { ascending: true });

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError);
    throw new Error(submissionsError.message);
  }

  const publishedZines = zines || [];
  const allAuthors = authors || [];
  const allSubmissions = submissions || [];

  // Calculate total counts
  const totalPublishedZines = publishedZines.length;
  const totalAuthors = allAuthors.length;
  const totalSubmissions = allSubmissions.length;

  // Get unique categories
  const categorySet = new Set<string>();
  publishedZines.forEach((zine) => {
    const categories = getZineCategories(zine.tags as Json);
    categories.forEach((cat) => categorySet.add(cat));
  });
  const totalCategoriesUsed = categorySet.size;

  // First zine date
  const firstZineDate =
    publishedZines.length > 0 && publishedZines[0].created_at
      ? publishedZines[0].created_at
      : null;

  // Zines by month
  const zinesByMonthMap = new Map<string, number>();
  publishedZines.forEach((zine) => {
    if (zine.created_at) {
      const monthKey = getMonthKey(zine.created_at);
      zinesByMonthMap.set(monthKey, (zinesByMonthMap.get(monthKey) || 0) + 1);
    }
  });

  const zinesByMonth: MonthlyData[] = Array.from(zinesByMonthMap.entries())
    .map(([month, count]) => {
      const date = new Date(month + "-01");
      return {
        month,
        count,
        monthName: formatMonthName(date),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  // Submissions by month
  const submissionsByMonthMap = new Map<string, number>();
  allSubmissions.forEach((submission) => {
    if (submission.created_at) {
      const monthKey = getMonthKey(submission.created_at);
      submissionsByMonthMap.set(
        monthKey,
        (submissionsByMonthMap.get(monthKey) || 0) + 1
      );
    }
  });

  const submissionsByMonth: MonthlyData[] = Array.from(
    submissionsByMonthMap.entries()
  )
    .map(([month, count]) => {
      const date = new Date(month + "-01");
      return {
        month,
        count,
        monthName: formatMonthName(date),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  // Peak submission date
  const submissionDateMap = new Map<string, number>();
  allSubmissions.forEach((submission) => {
    if (submission.created_at) {
      const dateKey = submission.created_at.split("T")[0];
      submissionDateMap.set(
        dateKey,
        (submissionDateMap.get(dateKey) || 0) + 1
      );
    }
  });

  let peakSubmissionDate: string | null = null;
  let peakSubmissionCount = 0;
  submissionDateMap.forEach((count, date) => {
    if (count > peakSubmissionCount) {
      peakSubmissionCount = count;
      peakSubmissionDate = date;
    }
  });

  // Zines by publication year
  const zinesByYearMap = new Map<number, number>();
  publishedZines.forEach((zine) => {
    if (zine.year) {
      zinesByYearMap.set(zine.year, (zinesByYearMap.get(zine.year) || 0) + 1);
    }
  });

  const zinesByYear: YearData[] = Array.from(zinesByYearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  // Top authors
  const authorZineCountMap = new Map<number, { name: string; count: number }>();
  publishedZines.forEach((zine) => {
    if (zine.library_zines_authors) {
      zine.library_zines_authors.forEach((authorRel: any) => {
        const authorId = authorRel.authors.id;
        const authorName = authorRel.authors.name;
        const current = authorZineCountMap.get(authorId) || {
          name: authorName,
          count: 0,
        };
        authorZineCountMap.set(authorId, {
          name: authorName,
          count: current.count + 1,
        });
      });
    }
  });

  const topAuthors: TopAuthor[] = Array.from(authorZineCountMap.entries())
    .map(([authorId, data]) => ({
      authorId,
      authorName: data.name,
      zineCount: data.count,
    }))
    .sort((a, b) => b.zineCount - a.zineCount)
    .slice(0, 10);

  // Top categories
  const categoryCountMap = new Map<string, number>();
  publishedZines.forEach((zine) => {
    const categories = getZineCategories(zine.tags as Json);
    categories.forEach((cat) => {
      categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1);
    });
  });

  const topCategories: TopCategory[] = Array.from(categoryCountMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Most active months (by submissions)
  const mostActiveMonths = [...submissionsByMonth]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Monthly growth rate
  const monthlyGrowthRate: number[] = [];
  for (let i = 1; i < zinesByMonth.length; i++) {
    const prevCount = zinesByMonth[i - 1].count;
    const currentCount = zinesByMonth[i].count;
    const growth = prevCount > 0 ? ((currentCount - prevCount) / prevCount) * 100 : 0;
    monthlyGrowthRate.push(growth);
  }

  // Cumulative zines over time
  let cumulative = 0;
  const cumulativeZines: MonthlyData[] = zinesByMonth.map((month) => {
    cumulative += month.count;
    return {
      ...month,
      count: cumulative,
    };
  });

  return {
    totalPublishedZines,
    totalAuthors,
    totalSubmissions,
    totalCategoriesUsed,
    firstZineDate,
    zinesByMonth,
    submissionsByMonth,
    zinesByYear,
    peakSubmissionDate,
    peakSubmissionCount,
    topAuthors,
    topCategories,
    mostActiveMonths,
    monthlyGrowthRate,
    cumulativeZines,
  };
}


