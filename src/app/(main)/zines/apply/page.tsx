"use client";

import { Suspense, useTransition } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
// @ts-expect-error
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDataZineSchema, type FormZineData } from "@/schemas/apply-zine";
import { submitZine } from "./actions";
import FormHeader from "@/components/apply-zine/form-header";
import FormSection from "@/components/ui/form-section";
import ActionButton from "@/components/ui/action-button";
import Button from "@/components/button";
import AuthorForm from "@/components/apply-zine/author-form";
import AdditionalInfoForm from "@/components/apply-zine/additional-info-form";
import { toast } from "sonner";
import { ZineForm } from "@/components/apply-zine/zine-form";

export default function ApplyZineForm() {
  const methods = useForm<FormZineData>({
    resolver: zodResolver(FormDataZineSchema),
    defaultValues: {
      authors: [{ name: "", socialLinks: [] }],
      zines: [],
      additionalInfo: { contactEmail: "" },
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const {
    fields: authors,
    append: appendAuthor,
    remove: removeAuthor,
  } = useFieldArray({
    control,
    name: "authors",
  });

  const {
    fields: zines,
    append: appendZine,
    remove: removeZine,
  } = useFieldArray({
    control,
    name: "zines",
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: any) => {
    if (isSubmitting || isPending) return;

    const fd = new FormData();
    fd.set("authors", JSON.stringify(data.authors));
    fd.set("contactEmail", data.additionalInfo.contactEmail);
    data.zines.forEach((z: any, i: number) => {
      fd.append(`zines[${i}][title]`, z.title);
      fd.append(`zines[${i}][collectionTitle]`, z.collectionTitle || "");
      fd.append(`zines[${i}][year]`, z.year);
      fd.append(`zines[${i}][description]`, z.description || "");
      if (z.pdfFile) fd.append(`zines[${i}][pdfFile]`, z.pdfFile);
      if (z.coverImageFile) fd.append(`zines[${i}][coverImageFile]`, z.coverImageFile);
    });

    startTransition(async () => {
      const result = await submitZine(fd);
      if (result.success) {
        toast.success(result.message);
        methods.reset();
      } else {
        toast.error("Erro ao enviar formulário");
      }
    });
  };

  return (
    <main className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FormHeader />
            <FormSection title="Autores">
              <div className="space-y-6">
                {authors.map((_, idx) => (
                  <AuthorForm
                    key={authors[idx].id}
                    index={idx}
                    isRemovable={authors.length > 1}
                    onRemove={() => removeAuthor(idx)}
                    disabled={isSubmitting || isPending}
                  />
                ))}

                <ActionButton
                  type="button"
                  variant="ghost"
                  onClick={() => appendAuthor({ name: "", socialLinks: [] })}
                  className="w-full py-3"
                  disabled={isSubmitting || isPending}
                >
                  + Adicionar outro autor
                </ActionButton>
              </div>
            </FormSection>

            {/* Zines */}
            <FormSection
              title="Zines"
              headerAction={
                <ActionButton
                  type="button"
                  variant="primary"
                  onClick={() =>
                    appendZine({
                      id: Date.now().toString(),
                      title: "",
                      collectionTitle: "",
                      year: "",
                      description: "",
                      pdfFile: undefined,
                      coverImageFile: undefined,
                    })
                  }
                  disabled={isSubmitting || isPending}
                >
                  + Adicionar Zine
                </ActionButton>
              }
            >
              {zines.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium mb-2">Nenhuma zine ainda</h3>
                  <p className="text-neutral-600 mb-6">Comece adicionando seu livrinho em PDF!</p>
                  <ActionButton
                    variant="primary"
                    onClick={() =>
                      appendZine({
                        id: Date.now().toString(),
                        title: "",
                        collectionTitle: "",
                        year: "",
                        description: "",
                        pdfFile: undefined,
                        coverImageFile: undefined,
                      })}
                  >
                    Adicionar Zine
                  </ActionButton>
                </div>
              ) : (
                <div className="space-y-6">
                  {zines.map((_, idx) => (
                    <ZineForm
                      key={zines[idx].id}
                      index={idx}
                      onRemove={() => removeZine(idx)}
                      disabled={isSubmitting || isPending}
                    />
                  ))}
                </div>
              )}
            </FormSection>

            <AdditionalInfoForm disabled={isSubmitting || isPending} />

            <div className="pt-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isPending || zines.length === 0}
                  className="flex-1 md:flex-none"
                >
                  {isSubmitting || isPending
                    ? "Enviando..."
                    : `Enviar ${zines.length} Zine${zines.length > 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          </form>
          <footer className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-600">
            <p>Valeu! 💜</p>
          </footer>
        </FormProvider>
      </div>
    </main>
  );
}

export function ApplyZine() {
  return (
    <Suspense fallback={<p>Carregando formulário…</p>}>
      <ApplyZineForm />
    </Suspense>
  );
}
