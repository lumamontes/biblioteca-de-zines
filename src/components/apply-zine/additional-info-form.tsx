"use client";
import { useFormContext } from "react-hook-form";
import FormSection from "@/components/ui/form-section";
import Input from "@/components/ui/input";
import { z } from "zod";
import { FormDataZineSchema } from "@/schemas/apply-zine";

export default function AdditionalInfoForm({ disabled = false }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<z.infer<typeof FormDataZineSchema>>();

  return (
    <FormSection title="Informações Adicionais">
      <div className="space-y-4">
        <Input
          id="contact-email"
          label="Email para Contato (opcional)"
          type="email"
          {...register("additionalInfo.contactEmail")}
          placeholder="seu@email.com"
          helperText="Caso queiramos entrar em contato sobre sua zine"
          disabled={disabled}
        />
        {errors.additionalInfo?.contactEmail && (
          <p className="text-red-600 text-sm">
            {errors.additionalInfo.contactEmail.message}
          </p>
        )}
      </div>
    </FormSection>
  );
}

