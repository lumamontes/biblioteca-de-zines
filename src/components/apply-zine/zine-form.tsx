
import { Controller, useFormContext } from "react-hook-form"
import Input from "../ui/input"
import ActionButton from "../ui/action-button"
import Textarea from "../ui/textarea"
import { InputFile } from "../ui/input-file"
import { Label } from "../ui/label"


type ZineFormProps = {
  index: number
  onRemove: () => void
  disabled?: boolean
}

export function ZineForm({ index, onRemove, disabled }: ZineFormProps) {
  const { register, control } = useFormContext()
  return (
    <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Título da Zine *"
          placeholder="Nome da sua zine"
          {...register(`zines.${index}.title`)}
          disabled={disabled}
        />

        <Input
          label="Título da Coleção (opcional)"
          placeholder="Se faz parte de uma série"
          {...register(`zines.${index}.collectionTitle`)}
          disabled={disabled}
        />

        <Input
          label="Ano de Publicação *"
          placeholder="2024"
          {...register(`zines.${index}.year`)}
          disabled={disabled}
        />
        <div></div>
        <div className="md:col-span-2">
          <Label> PDF da Zine</Label>
          <Controller
            control={control}
            name={`zines.${index}.pdfFile` as const}
            render={({ field }) => (
              <InputFile
                onFileAccepted={field.onChange}
                onFileRejected={console.error}
                config={{
                  accept: "application/pdf",
                  helperText: "Envie seu arquivo PDF (até 30MB)",
                  maxSize: 30 * 1024 * 1024,
                  disabled,
                }}
              />
            )}
          />
        </div>
        <div className="md:col-span-2">
          <Label> Imagem da Capa (opcional)</Label>
          <Controller
            control={control}
            name={`zines.${index}.coverImageFile` as const}
            render={({ field }) => (
              <InputFile
                onFileAccepted={field.onChange}
                onFileRejected={console.error}
                config={{
                  accept: "image/*",
                  helperText: "Envie a imagem da capa (até 30MB)",
                  maxSize: 30 * 1024 * 1024,
                  disabled,
                }}
              />
            )}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Descrição (opcional)"
            placeholder="Conte um pouco sobre sua zine..."
            rows={3}
            {...register(`zines.${index}.description`)}
            disabled={disabled}
          />
        </div>
      </div>

      <ActionButton type="button" variant="danger" size="sm" onClick={onRemove} disabled={disabled}>
        Remover Zine
      </ActionButton>
    </div>
  )
}

