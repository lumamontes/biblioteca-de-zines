import ZineCard from "@/components/zine-card/zine-card";
import { getZinesWithSpecificTag } from "@/services/zine-service";
import Image from "next/image";
import Link from "next/link";

const monthlyThemes = [
  { month: "Agosto", theme: "Cacarecos", status: "passado" },
  { month: "Setembro", theme: "Lista", status: "atual" },
];

export default async function ZinesClub() {
  const zines = await getZinesWithSpecificTag('Clube de Zines');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="px-4 py-12 max-w-4xl mx-auto">

        <Image 
          src="/clubedezines.png"
          alt="Clube de Zines"
          width={300}
          height={200}
          className="mx-auto mb-6"
        />

        <h1 className="text-3xl font-mono mb-6 text-center">
          Clube de Zines
        </h1>
        <div className="prose max-w-none text-center">
          <p className="text-lg mb-4 font-mono">
            Um clube online para temas mensais e criação de zines.
          </p>
          <p className="text-sm text-gray-600 font-mono">
            Interprete os temas como quiser. Compartilhe com #ClubeDeZines
          </p>
        </div>
      </section>

      {/* Monthly Themes */}
      <section className="px-4 py-12 max-w-4xl mx-auto border-t border-gray-200">
        <h2 className="text-xl font-mono mb-8 text-center">
          Temas 2025
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyThemes.map((item) => (
            <div 
              key={item.month}
              className={`p-4 border font-mono text-center ${
                item.status === 'atual' 
                  ? 'border-black bg-gray-50' 
                  : item.status === 'passado'
                  ? 'border-gray-300 text-gray-500'
                  : 'border-gray-200'
              }`}
            >
              <div className="text-sm text-gray-600">{item.month}</div>
              <div className="text-lg font-medium">{item.theme}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Participation Instructions */}
      <section className="px-4 py-12 max-w-4xl mx-auto border-t border-gray-200">
        <h2 className="text-xl font-mono mb-8 text-center">
          Como Participar
        </h2>
        <div className="space-y-6 font-mono text-sm">
          <div className="flex gap-4">
            <span className="text-gray-400">01.</span>
            <div>
              <strong>Crie</strong> um zine baseado no tema do mês
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400">02.</span>
            <div>
              <strong>Compartilhe</strong> nas redes com <code className="bg-gray-100 px-1">#ClubeDeZines</code>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400">03.</span>
            <div>
              <strong>Envie</strong> para o acervo da biblioteca
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/zines/apply"
            className="font-mono text-sm border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors inline-block"
          >
            Enviar Zine
          </Link>
        </div>
      </section>

      {/* Zines Collection */}
      {zines && zines.length > 0 && (
        <section className="px-4 py-12 max-w-6xl mx-auto border-t border-gray-200">
          <h2 className="text-xl font-mono mb-8 text-center">
            Zines do Clube ({zines.length})
          </h2>
          <div 
            role="grid"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            aria-live="polite"
          >
            {zines.map((zine) => (
              <ZineCard key={zine.uuid} zine={zine} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {(!zines || zines.length === 0) && (
        <section className="px-4 py-12 max-w-4xl mx-auto border-t border-gray-200 text-center">
          <p className="font-mono text-gray-600 mb-6">
            Nenhum zine do clube publicado ainda.
          </p>
          <Link 
            href="/zines/apply"
            className="font-mono text-sm border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors inline-block"
          >
            Seja o primeiro
          </Link>
        </section>
      )}
    </div>
  );
}
