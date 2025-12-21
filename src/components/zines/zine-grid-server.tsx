import ZineCardServer from '@/components/zine-card/zine-card-server';
import { Zine } from '@/@types/zine';

interface ZineGridServerProps {
  zines: Zine[];
}

export function ZineGridServer({ zines }: ZineGridServerProps) {
  if (zines.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="bg-white border-2rounded-lg p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">:((</div>
          <p className="text-lg font-medium mb-2">
            Nenhum zine encontrado
          </p>
          <p className="text-sm mb-4">
            Parece que não há zines disponíveis no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="grid"
      className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-3"
      aria-live="polite"
      aria-label={`${zines.length} zines encontrados`}
    >
      {zines.map((zine) => (
        <ZineCardServer 
          key={zine.uuid} 
          zine={zine} 
        />
      ))}
    </div>
  );
}

