import { Zine } from "@/types/apply-zine";
import ActionButton from "@/components/ui/action-button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";

interface ZineFormProps {
  zine: Zine;
  zineIndex: number;
  onUpdateZine: (id: string, field: keyof Omit<Zine, 'id'>, value: string) => void;
  onRemoveZine: (id: string) => void;
  disabled?: boolean;
}

export default function ZineForm({
  zine,
  zineIndex,
  onUpdateZine,
  onRemoveZine,
  disabled = false,
}: ZineFormProps) {
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
          label="Título da Zine *"
          type="text"
          value={zine.title}
          onChange={(e) => onUpdateZine(zine.id, 'title', e.target.value)}
          placeholder="Nome da sua zine"
          required
          disabled={disabled}
        />

        <Input
          label="Título da Coleção (opcional)"
          type="text"
          value={zine.collectionTitle}
          onChange={(e) => onUpdateZine(zine.id, 'collectionTitle', e.target.value)}
          placeholder="Se faz parte de uma série"
          disabled={disabled}
        />

        <Input
          label="Ano de Publicação (opcional)"
          type="text"
          value={zine.publicationYear}
          onChange={(e) => onUpdateZine(zine.id, 'publicationYear', e.target.value)}
          placeholder="2024"
          disabled={disabled}
        />

        <Input
          label="Link do PDF *"
          type="url"
          value={zine.pdfUrl}
          onChange={(e) => onUpdateZine(zine.id, 'pdfUrl', e.target.value)}
          placeholder="https://drive.google.com/..."
          required
          disabled={disabled}
        />

        <div className="md:col-span-2">
          <Input
            label="Imagem da Capa (opcional)"
            type="url"
            value={zine.coverImageUrl}
            onChange={(e) => onUpdateZine(zine.id, 'coverImageUrl', e.target.value)}
            placeholder="https://exemplo.com/capa.jpg"
            disabled={disabled}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Descrição (opcional)"
            value={zine.description}
            onChange={(e) => onUpdateZine(zine.id, 'description', e.target.value)}
            rows={3}
            placeholder="Conte um pouco sobre sua zine..."
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
} 