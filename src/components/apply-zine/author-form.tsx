import { useFormContext, useFieldArray } from "react-hook-form";
import { FormZineData } from "@/schemas/apply-zine";
import Input from "@/components/ui/input";
import ActionButton from "@/components/ui/action-button";

interface AuthorFormProps {
  index: number;
  isRemovable: boolean;
  onRemove: () => void;
  disabled?: boolean;
}

export default function AuthorForm({
  index,
  isRemovable,
  onRemove,
  disabled = false,
}: AuthorFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormZineData>();

  const { fields: socials, append, remove } = useFieldArray({
    control,
    // @ts-expect-error 
    name: `authors.${index}.socialLinks` as const,
  });

  return (
    <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          Autor {index + 1}
        </h3>

        {isRemovable && (
          <ActionButton
            type="button"
            variant="danger"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
          >
            Remover
          </ActionButton>
        )}
      </div>

      <div className="space-y-4">
        <Input
          label="Nome do Autor *"
          {...register(`authors.${index}.name`)}
          disabled={disabled}
          placeholder="Nome completo do autor"
        />
        {errors.authors?.[index]?.name && (
          <p className="text-red-600 text-sm">
            {errors.authors[index]!.name!.message}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Redes sociais (opcional)
          </label>
          <div className="space-y-2">
            {socials.map((field, i) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <Input
                  type="url"
                  placeholder="https://instagram.com/usuario"
                  {...register(`authors.${index}.socialLinks.${i}`)}
                  disabled={disabled}
                  className="flex-1"
                />
                {socials.length > 1 && (
                  <ActionButton
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => remove(i)}
                    disabled={disabled}
                  >
                    ×
                  </ActionButton>
                )}
              </div>
            ))}
            <ActionButton
              type="button"
              variant="secondary"
              size="sm"
              //@ts-expect-error
              onClick={() => append("")}
              disabled={disabled}
            >
              + Adicionar link
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
