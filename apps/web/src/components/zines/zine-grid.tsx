import { memo } from 'react';
import ZineCard from '@/components/zine-card/zine-card';
import ZineCardSkeleton from '@/components/zine-card/zine-card.skeleton';
import { Zine } from '@/@types/zine';

interface ZineGridProps {
  zines: Zine[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCategoryClick: (category: string) => void;
}

const EmptyState = memo<{ hasActiveFilters: boolean; onClearFilters: () => void }>(({
  hasActiveFilters,
  onClearFilters
}) => (
  <div className="col-span-full text-center py-12">
    <div className="bg-white border-2rounded-lg p-8 max-w-md mx-auto">
      <div className="text-4xl mb-4">:((</div>
      <p className=" text-lg font-medium mb-2">
        Nenhum zine encontrado
      </p>
      <p className=" text-sm mb-4">
        {hasActiveFilters 
          ? 'Tente ajustar os filtros para encontrar mais zines.'
          : 'Parece que não há zines disponíveis no momento.'
        }
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className=" px-4 py-2 rounded-lg border font-medium transition-colors duration-200 hover:bg-neutral-100"
        >
          Limpar filtros
        </button>
      )}
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

const LoadingSkeleton = memo(() => (
  <>
    {Array.from({ length: 6 }, (_, index) => (
      <ZineCardSkeleton key={`skeleton-${index}`} />
    ))}
  </>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const ZineGrid = memo<ZineGridProps>(({
  zines,
  loading,
  hasActiveFilters,
  onClearFilters,
  onCategoryClick
}) => {
  const renderContent = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }
    
    if (zines.length === 0) {
      return (
        <EmptyState 
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      );
    }
    
    return zines.map((zine) => (
      <ZineCard 
        key={zine.uuid} 
        zine={zine} 
        onCategoryClick={onCategoryClick} 
      />
    ));
  };

  return (
    <div
      role="grid"
      className="grid grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-3"
      aria-live="polite"
      aria-label={`${loading ? 'Carregando' : zines.length} zines encontrados`}
    >
      {renderContent()}
    </div>
  );
});

ZineGrid.displayName = 'ZineGrid';
