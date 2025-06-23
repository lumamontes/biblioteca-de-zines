import { Controller, useFormContext } from "react-hook-form"
import Input from "../ui/input"
import ActionButton from "../ui/action-button"
import Textarea from "../ui/textarea"
import { InputFile } from "../ui/input-file"
import { Label } from "../ui/label"
import InputError from "../ui/input-error"

type ZineFormProps = {
  index: number
  onRemove: () => void
  disabled?: boolean
}

export function ZineForm({ index, onRemove, disabled }: ZineFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()
  // @ts-expect-error
  const zineErrors = (errors.zines?.[index] ?? {}) as any

  return (
    <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Título da Zine *"
            placeholder="Nome da sua zine"
            {...register(`zines.${index}.title`)}
            disabled={disabled}
          />
          <InputError message={zineErrors?.title?.message} />
        </div>

        <div>
          <Input
            label="Título da Coleção (opcional)"
            placeholder="Se faz parte de uma série"
            {...register(`zines.${index}.collectionTitle`)}
            disabled={disabled}
          />
          <InputError message={zineErrors?.collectionTitle?.message} />
        </div>

        <div>
          <Input
            label="Ano de Publicação *"
            placeholder="2024"
            {...register(`zines.${index}.year`)}
            disabled={disabled}
          />
          <InputError message={zineErrors?.year?.message} />
        </div>

        <div className="md:col-span-2">
          <Label>PDF da Zine</Label>
          <div className="border border-dashed border-neutral-300 rounded-md p-4 space-y-4 bg-white">
            <Controller
              control={control}
              name={`zines.${index}.pdfFile` as const}
              defaultValue={null}
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
            <InputError message={zineErrors?.pdfFile?.message} />

            <div className="flex items-center justify-center text-sm text-neutral-500 font-medium">
              <span className="px-2">ou envie o link</span>
            </div>

            <Controller
              control={control}
              name={`zines.${index}.pdfUrl` as const}
              defaultValue=""
              render={({ field }) => (
                <Input
                  label="Link do PDF"
                  placeholder="https://drive.google.com/..."
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
            <InputError message={zineErrors?.pdfUrl?.message} />
          </div>
        </div>

        <div className="md:col-span-2">
          <Label>Imagem da Capa (opcional)</Label>
          <div className="border border-dashed border-neutral-300 rounded-md p-4 space-y-4 bg-white">
            <Controller
              control={control}
              name={`zines.${index}.coverImageFile` as const}
              defaultValue={null}
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
            <InputError message={zineErrors?.coverImageFile?.message} />

            <div className="flex items-center justify-center text-sm text-neutral-500 font-medium">
              <span className="px-2">ou envie o link da imagem</span>
            </div>

            <Controller
              control={control}
              name={`zines.${index}.coverImageUrl` as const}
              defaultValue=""
              render={({ field }) => (
                <Input
                  label="Link da Imagem da Capa"
                  placeholder="https://exemplo.com/capa.jpg"
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
            <InputError message={zineErrors?.coverImageUrl?.message} />
          </div>
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Descrição (opcional)"
            placeholder="Conte um pouco sobre sua zine..."
            rows={3}
            {...register(`zines.${index}.description`)}
            disabled={disabled}
          />
          <InputError message={zineErrors?.description?.message} />
        </div>
      </div>

      <ActionButton type="button" variant="danger" size="sm" onClick={onRemove} disabled={disabled}>
        Remover Zine
      </ActionButton>
    </div>
  )
}
