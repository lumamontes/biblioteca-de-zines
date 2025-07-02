"use client";

import Button from "@/components/button";
import FormHeader from "@/components/apply-zine/form-header";
import AuthorForm from "@/components/apply-zine/author-form";
import ZineForm from "@/components/apply-zine/zine-form";
import AdditionalInfoForm from "@/components/apply-zine/additional-info-form";
import FormSection from "@/components/ui/form-section";
import ActionButton from "@/components/ui/action-button";
import { useAuthorForm } from "@/hooks/use-author-form";
import { useZineForm } from "@/hooks/use-zine-form";
import { useAdditionalInfoForm } from "@/hooks/use-additional-info-form";
import { submitZine } from "./actions";
import InfoBox from "@/components/ui/info-box";
import { useCallback, useTransition, Suspense } from "react";
import { get } from "@/utils/local-storage";
import { toast } from "sonner";
import { pipe } from "composable-functions";

const hasFormDataInStorage = (): boolean => {
  const formData = get('apply-zine-form-data', { 
    authors: [], 
    zines: [], 
    additionalInfo: { contactEmail: '' }
  });
  return (
    formData.authors?.some((author: { name?: string }) => author.name?.trim()) ||
    formData.zines?.length > 0 ||
    !!formData.additionalInfo?.contactEmail
  );
};

function ApplyZineForm() {
  const authorForm = useAuthorForm();
  const zineForm = useZineForm();
  const additionalInfoForm = useAdditionalInfoForm();
  const [isPending, startTransition] = useTransition();

  const clearAllForms = useCallback(() => {
    authorForm.clearAuthors();
    zineForm.clearZines();
    additionalInfoForm.clearAdditionalInfo();
  }, [authorForm, zineForm, additionalInfoForm]);

  const handleSubmit = async (formData: FormData) => {
    if (isPending) {
      return;
    }

    //Usa o pipe pra pegar erros de todas as validações
    const validateAllForms = pipe(
      () => authorForm.validateAuthors(authorForm.authors),
      () => zineForm.validateZines(zineForm.zines),
      () => additionalInfoForm.validateAdditionalInfo(additionalInfoForm)
    );

    const validationResult = await validateAllForms();
    
    if (!validationResult.success) {
      toast.error(validationResult.errors[0]?.message || 'Erro de validação');
      return;
    }
    
    formData.set('authors', JSON.stringify(authorForm.authors));
    formData.set('zines', JSON.stringify(zineForm.zines));
    formData.set('contactEmail', additionalInfoForm.contactEmail);
    
    startTransition(async () => {
      const result = await submitZine(formData);
      
      if (result.success) {
        toast.success(result.data.message);
        clearAllForms();
      } else {
        toast.error(result.errors[0]?.message || 'Erro ao enviar formulário');
      }
    });
  };

  const handleClearForm = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados do formulário? Esta ação não pode ser desfeita.")) {
      clearAllForms();
    }
  };

  const hasFormData = hasFormDataInStorage();
  const isFormDisabled = isPending || zineForm.zines.length === 0;

  return (
    <main className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <FormHeader />

        <form action={handleSubmit} className="space-y-8">
          <FormSection title="Autores">
            <div className="space-y-6">
              {authorForm.authors.map((author, authorIndex) => (
                <AuthorForm
                  key={authorIndex}
                  author={author}
                  authorIndex={authorIndex}
                  isRemovable={authorForm.authors.length > 1}
                  onUpdateName={authorForm.updateAuthorName}
                  onAddSocialLink={authorForm.addSocialLinkToAuthor}
                  onRemoveSocialLink={authorForm.removeSocialLinkFromAuthor}
                  onUpdateSocialLink={authorForm.updateAuthorSocialLink}
                  onRemoveAuthor={authorForm.removeAuthor}
                  disabled={isPending}
                />
              ))}
              
              <ActionButton
                type="button"
                variant="ghost"
                onClick={authorForm.addAuthor}
                className="w-full py-3"
                disabled={isPending}
              >
                + Adicionar outro autor
              </ActionButton>
            </div>
          </FormSection>

          <FormSection 
            title="Zines"
            headerAction={
              <ActionButton
                type="button"
                variant="primary"
                onClick={zineForm.addZine}
                disabled={isPending}
              >
                + Adicionar Zine
              </ActionButton>
            }
          >
            {zineForm.zines.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-6xl mb-4">
                  📚
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Nenhum zine adicionado ainda
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Comece adicionando seu primeiro zine para enviar sua aplicação.
                </p>
                <ActionButton
                  variant="primary"
                  onClick={zineForm.addZine}
                >
                  Adicionar Zine
                </ActionButton>
              </div>
            ) : (
              <div className="space-y-6">
                <InfoBox className="mt-4">
                  <p>
                    <strong>Recomendação:</strong>
                    {' '}Sugerimos o uso de links do Google Drive para o PDF e imagem da capa, pois são mais estáveis e confiáveis. Certifique-se de que os links estão públicos e acessíveis.
                  </p>
                </InfoBox>
                {zineForm.zines.map((zine, index) => (
                  <ZineForm
                    key={zine.id}
                    zine={zine}
                    zineIndex={index}
                    onUpdateZine={zineForm.updateZine}
                    onRemoveZine={zineForm.removeZine}
                    onUpdateCategories={zineForm.updateZineCategories}
                    disabled={isPending}
                  />
                ))}
                
              </div>
            )}
          </FormSection>

          <AdditionalInfoForm
            contactEmail={additionalInfoForm.contactEmail}
            onContactEmailChange={additionalInfoForm.setContactEmail}
            disabled={isPending}
          />

          <div className="pt-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="flex-1 md:flex-none"
              >
                {isPending ? "Enviando..." : `Enviar ${zineForm.zines.length} Zine${zineForm.zines.length !== 1 ? 's' : ''}`}
              </Button>
              
              {hasFormData && (
                <ActionButton
                  type="button"
                  variant="secondary"
                  onClick={handleClearForm}
                  disabled={isPending}
                >
                  Limpar Formulário
                </ActionButton>
              )}
            </div>
            
            {zineForm.zines.length === 0 && (
              <p className="text-sm text-neutral-600">
                Você precisa adicionar pelo menos um zine para enviar o formulário.
              </p>
            )}
          </div>
        </form>

        <footer className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-600">
          <p>Valeu! 💜</p>
        </footer>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-neutral-200 rounded"></div>
            <div className="h-12 bg-neutral-200 rounded"></div>
            <div className="h-12 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ApplyZine() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ApplyZineForm />
    </Suspense>
  );
}
