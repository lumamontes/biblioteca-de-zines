import ZineCard from "@/components/zine-card/zine-card";
import { getZinesWithSpecificTag } from "@/services/zine-service";
import Image from "next/image";
import Link from "next/link";

const monthlyThemes = [
  { 
    month: "Agosto 2025", 
    theme: "Cacarecos", 
    status: "passado",
    instagramLink: "https://www.instagram.com/p/DN_RiHTkbRz/?igsh=dzlhdmN4ZTlhODhu"
  },
  { 
    month: "Setembro 2025", 
    theme: "Lista", 
    status: "passado",
    instagramLink: "https://www.instagram.com/p/DOHMTMaD4iW/?igsh=M2c0NGMwN2hhMnd5"
  },
  { 
    month: "Outubro 2025", 
    theme: "Zinetober", 
    status: "passado",
    instagramLink: "https://www.instagram.com/p/DPRLWG3DfqZ/?igsh=MThyOHA2dWw4YnRiNA=="
  },
  { 
    month: "Novembro 2025", 
    theme: "Casa", 
    status: "passado",
    instagramLink: "https://www.instagram.com/p/DRE_kZIEavb/?igsh=MTg5ZWZham15ZDJieQ=="
  },
  { 
    month: "Fevereiro 2026", 
    theme: "Colagem", 
    status: "atual",
    instagramLink: "https://www.instagram.com/p/DUNxvVbkRuI/?igsh=MWl0b2E0dHdycXZnbQ=="
  },
];

export default async function ZinesClub() {
  const zines = await getZinesWithSpecificTag('Clube de Zines');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="px-4 py-12 max-w-4xl mx-auto">

        <Image 
          src="/clubedezine_header_asset.png"
          alt="Clube de Zines"
          width={600}
          height={400}
          className="mx-auto mb-6"
        />

        <h1 className="text-3xl font-mono mb-6 text-center">
          Clube de Zines
        </h1>
        <div className="prose max-w-none text-center">
          <p className="text-sm mb-4 text-gray-600 font-mono">
            📚✍️ Uma iniciativa para estimular criatividade e comunidade!
          </p>
          <p className="text-sm mb-4 text-gray-600 font-mono">
            O clubinho virtual da Biblioteca de Zines está de volta! Cada mês temos um tema novo votado pela comunidade para criar zines na sua interpretação e formato preferido.
          </p>
          <p className="text-sm mb-6 text-gray-600 font-mono">
            Faça zines, compartilhe com <span className="bg-gray-100 px-1">#ClubeDeZines</span> e envie para o nosso acervo digital! 💫
          </p>
        </div>
      </section>

      {/* Monthly Themes */}
      <section className="px-4 py-12 max-w-4xl mx-auto border-t border-gray-200">
        <h2 className="text-xl font-mono mb-8 text-center">
          Temas 2025-2026
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
              {item.instagramLink && (
                <Link 
                  href={item.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 block"
                >
                  Ver post no Instagram
                </Link>
              )}
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
              <strong>Crie</strong> um zine baseado no tema do mês na sua interpretação preferida
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400">02.</span>
            <div>
              <strong>Compartilhe</strong> nas redes com <code className="bg-gray-100 px-1">#ClubeDeZines</code> e marque a @biblioteca.de.zines
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400">03.</span>
            <div>
              <strong>Envie</strong> para o acervo da biblioteca
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400">04.</span>
            <div>
              <strong>Participe</strong> das discussões no nosso <Link href="https://t.me/+-irW84jni8ExYWFh" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">grupo do Telegram</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 border font-mono text-sm text-center">
          <p className="mb-2"><strong>Links importantes:</strong></p>
          <div className="space-y-1">
            <p><Link href="https://t.me/+-irW84jni8ExYWFh" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Grupo do Telegram</Link> (discussões, WIPs, etc.)</p>
            <p> <Link href="https://open.substack.com/pub/bibliotecadezines/p/colecao-do-clube-de-zines-1?r=53s7hh&utm_campaign=post&utm_medium=web&showWelcomeOnShare=false" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Newsletter</Link> com resumo dos primeiros meses</p>
            <p> Site: www.biblioteca-de-zines.com.br</p>
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
