import { Zine } from "@/schemas/apply-zine";
import { useState, useEffect } from "react";
import ActionButton from "@/components/ui/action-button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import MultiSelect from "@/components/ui/multi-select";
import { getCategories } from "@/services/categories-service";
import { Tables } from "@/types/database.types";

interface ZineFormProps {
  zine: Zine;
  zineIndex: number;
  onUpdateZine: (id: string, e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRemoveZine: (id: string) => void;
  onUpdateCategories: (id: string, categories: string[]) => void;
  disabled?: boolean;
}

export default function ZineForm({
  zine,
  zineIndex,
  onUpdateZine,
  onRemoveZine,
  onUpdateCategories,
  disabled = false,
}: ZineFormProps) {
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          Zine {zineIndex + 1}
        </h3>
        <ActionButton
          type="button"
          variant="danger"
          size="sm"
          onClick={() => onRemoveZine(zine.id)}
          disabled={disabled}
        >
          Remover Zine
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id={`zine-${zine.id}-title`}
          label="Título da Zine *"
          type="text"
          data-title="title"
          value={zine.title}
          onChange={(e) => onUpdateZine(zine.id, e)}
          placeholder="Nome da sua zine"
          required
          disabled={disabled}
        />

        <Input
          id={`zine-${zine.id}-collection-title`}
          label="Título da Coleção (opcional)"
          type="text"
          value={zine.collectionTitle || ''}
          data-title="collectionTitle"
          onChange={(e) => onUpdateZine(zine.id, e)}
          placeholder="Se faz parte de uma série"
          disabled={disabled}
        />

        <Input
          id={`zine-${zine.id}-year`}
          label="Ano de Publicação *"
          type="text"
          value={zine.year}
          data-title="year"
          onChange={(e) => onUpdateZine(zine.id, e)}
          placeholder="2024"
          required
          disabled={disabled}
        />

        <Input
          id={`zine-${zine.id}-pdf-url`}
          label="Link do PDF *"
          type="url"
          value={zine.pdfUrl}
          data-title="pdfUrl"
          onChange={(e) => onUpdateZine(zine.id, e)}
          placeholder="https://drive.google.com/..."
          required
          disabled={disabled}
        />

        <div className="md:col-span-2">
          <Input
            id={`zine-${zine.id}-cover-image`}
            label="Imagem da Capa (opcional)"
            type="url"
            data-title="coverImageUrl"
            value={zine.coverImageUrl || ''}
            onChange={(e) => onUpdateZine(zine.id, e)}
            placeholder="https://exemplo.com/capa.jpg"
            disabled={disabled}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            id={`zine-${zine.id}-description`}
            label="Descrição (opcional)"
            data-title="description"
            value={zine.description || ''}
            onChange={(e) => onUpdateZine(zine.id, e)}
            rows={3}
            placeholder="Conte um pouco sobre sua zine..."
            disabled={disabled}
          />
        </div>

        <div className="md:col-span-2">
          {loadingCategories ? (
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
            </div>
          ) : (
            <MultiSelect
              label="Categorias (máx 3)"
              options={categories}
              selectedValues={zine.categories || []}
              onChange={(selectedCategories) => onUpdateCategories(zine.id, selectedCategories)}
              placeholder="Selecione até 3 categorias..."
              maxSelections={3}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </div>
  );
} 