import Link from "next/link";
import { getRetrospectiveStatistics } from "@/services/statistics-service";
import { StatCard } from "@/components/retrospectiva/stat-card";
import { MonthlyBreakdown } from "@/components/retrospectiva/monthly-breakdown";
import { TopAuthors } from "@/components/retrospectiva/top-authors";
import { TopCategories } from "@/components/retrospectiva/top-categories";
import { ExportButton } from "@/components/retrospectiva/export-button";
import Button from "@/components/button";
import { logout } from "../login/actions";

export default async function RetrospectivaPage() {
  const stats = await getRetrospectiveStatistics();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen max-w-8xl mx-auto px-6 py-8">
      <header className="flex items-center justify-between py-4 border-b mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-semibold">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-black">Retrospectiva {new Date().getFullYear()}</h1>
        </div>
        <Button className="bg-red-500 text-white px-4 py-2" onClick={logout}>
          Sair
        </Button>
      </header>

      <div className="mb-6">
        <ExportButton data={stats} />
      </div>

      {/* Total Counts Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Números Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Zines Publicadas"
            value={stats.totalPublishedZines}
            description="Total de zines arquivadas na biblioteca"
          />
          <StatCard
            title="Autores"
            value={stats.totalAuthors}
            description="Total de autores cadastrados"
          />
          <StatCard
            title="Submissões"
            value={stats.totalSubmissions}
            description="Total de zines recebidas via formulário"
          />
          <StatCard
            title="Categorias"
            value={stats.totalCategoriesUsed}
            description="Categorias diferentes utilizadas"
          />
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Linha do Tempo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <StatCard
            title="Primeira Zine"
            value={formatDate(stats.firstZineDate)}
            description="Data da primeira zine arquivada"
          />
          <StatCard
            title="Pico de Submissões"
            value={stats.peakSubmissionCount}
            description={
              stats.peakSubmissionDate
                ? `Em ${formatDate(stats.peakSubmissionDate)}`
                : "Nenhum dado disponível"
            }
          />
        </div>
      </section>

      {/* Monthly Breakdowns */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Crescimento Mensal</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyBreakdown
            title="Zines Arquivadas por Mês"
            data={stats.zinesByMonth}
          />
          <MonthlyBreakdown
            title="Submissões por Mês"
            data={stats.submissionsByMonth}
          />
        </div>
      </section>

      {/* Cumulative Growth */}
      {stats.cumulativeZines.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Crescimento Acumulado</h2>
          <MonthlyBreakdown
            title="Total de Zines ao Longo do Tempo"
            data={stats.cumulativeZines}
          />
        </section>
      )}

      {/* Zines by Year */}
      {stats.zinesByYear.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Zines por Ano de Publicação</h2>
          <div className="bg-white border-2 border-black p-6 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.zinesByYear.map((yearData) => (
                <div
                  key={yearData.year}
                  className="text-center border-2 border-gray-300 p-4"
                >
                  <div className="text-2xl font-black">{yearData.year}</div>
                  <div className="text-lg font-bold text-zine-green mt-2">
                    {yearData.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Performers */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Destaques</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.topAuthors.length > 0 && (
            <TopAuthors authors={stats.topAuthors} />
          )}
          {stats.topCategories.length > 0 && (
            <TopCategories categories={stats.topCategories} />
          )}
        </div>
      </section>

      {/* Most Active Months */}
      {stats.mostActiveMonths.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Meses Mais Ativos</h2>
          <div className="bg-white border-2 border-black p-6 shadow-lg">
            <div className="space-y-3">
              {stats.mostActiveMonths.map((month, index) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black w-8 text-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{month.monthName}</span>
                  </div>
                  <span className="font-bold text-zine-green">
                    {month.count} submissões
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Raw Data Section (for easy copying) */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dados Completos</h2>
        <div className="bg-gray-100 border-2 border-black p-4 overflow-auto">
          <pre className="text-xs">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}


