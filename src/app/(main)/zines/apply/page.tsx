"use client";

import Button from "@/components/button";
import FormHeader from "@/components/apply-zine/form-header";
import AuthorForm from "@/components/apply-zine/author-form";
import ZineForm from "@/components/apply-zine/zine-form";
import AdditionalInfoForm from "@/components/apply-zine/additional-info-form";
import FormSection from "@/components/ui/form-section";
import EmptyState from "@/components/ui/empty-state";
import SubmitMessage from "@/components/ui/submit-message";
import ActionButton from "@/components/ui/action-button";
import { useAuthorForm } from "@/hooks/use-author-form";
import { useZineForm } from "@/hooks/use-zine-form";
import { useAdditionalInfoForm } from "@/hooks/use-additional-info-form";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { submitZineApplicationWithRedirect } from "./actions";
import InfoBox from "@/components/ui/info-box";
import { useEffect } from "react";

export default function ApplyZine() {
  const authorForm = useAuthorForm();
  const zineForm = useZineForm();
  const additionalInfoForm = useAdditionalInfoForm();
  const formSubmission = useFormSubmission();

  // Clear form data after successful submission
  useEffect(() => {
    if (formSubmission.submitMessage.includes("sucesso")) {
      authorForm.clearAuthors();
      zineForm.clearZines();
      additionalInfoForm.clearAdditionalInfo();
    }
  }, [formSubmission.submitMessage, authorForm, zineForm, additionalInfoForm]);

  const handleSubmit = async (formData: FormData) => {
    const authorError = authorForm.validateAuthors();
    const zineError = zineForm.validateZines();
    const additionalInfoError = additionalInfoForm.validateAdditionalInfo();

    const validationError = authorError || zineError || additionalInfoError;
    if (validationError) {
      formSubmission.setSubmitMessage(validationError);
      return;
    }

    formSubmission.setIsSubmitting(true);
    formSubmission.setSubmitMessage("");
    
    formData.set('authors', JSON.stringify(authorForm.authors));
    formData.set('zines', JSON.stringify(zineForm.zines));
    formData.set('telegramInterest', additionalInfoForm.telegramInterest);
    formData.set('contactEmail', additionalInfoForm.contactEmail);
    
    try {
      await submitZineApplicationWithRedirect(formData);
    } catch (error) {
      formSubmission.setSubmitMessage("Erro ao enviar as zines. Tente novamente.");
      formSubmission.setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados do formulário?")) {
      authorForm.clearAuthors();
      zineForm.clearZines();
      additionalInfoForm.clearAdditionalInfo();
      formSubmission.setSubmitMessage("");
    }
  };

  const handleDismissMessage = () => {
    formSubmission.setSubmitMessage("");
  };

  const hasFormData = authorForm.authors.some(author => author.name.trim()) || 
                     zineForm.zines.length > 0 || 
                     additionalInfoForm.telegramInterest || 
                     additionalInfoForm.contactEmail;

  return (
    <main className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <FormHeader />

        <SubmitMessage 
          message={formSubmission.submitMessage} 
          variant="floating"
          onDismiss={handleDismissMessage}
        />

        <form action={handleSubmit} className="space-y-8">
          <FormSection title="Autor(es)">
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
                />
              ))}
              
              <ActionButton
                type="button"
                variant="ghost"
                onClick={authorForm.addAuthor}
                className="w-full py-3"
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
              >
                + Adicionar Zine
              </ActionButton>
            }
          >
            {zineForm.zines.length === 0 ? (
              <EmptyState
                icon="📚"
                title="Nenhuma zine adicionada"
                description="Clique em 'Adicionar Zine' para começar a adicionar suas zines à biblioteca"
                actionLabel="Adicionar Primeira Zine"
                onAction={zineForm.addZine}
              />
            ) : (
              <div className="space-y-6">
                <InfoBox className="mt-4">
                  <p>
                    <strong>Observação:</strong>
                    Recomendamos que você adicione links do google drive para o PDF e para a imagem da capa. Certifique-se de que os links estão acessíveis e que você tem permissão para compartilhar o arquivo.
                  </p>
                </InfoBox>
                {zineForm.zines.map((zine, index) => (
                  <ZineForm
                    key={zine.id}
                    zine={zine}
                    zineIndex={index}
                    onUpdateZine={zineForm.updateZine}
                    onRemoveZine={zineForm.removeZine}
                  />
                ))}
                
              </div>
            )}
          </FormSection>

          <AdditionalInfoForm
            telegramInterest={additionalInfoForm.telegramInterest}
            contactEmail={additionalInfoForm.contactEmail}
            onTelegramInterestChange={additionalInfoForm.setTelegramInterest}
            onContactEmailChange={additionalInfoForm.setContactEmail}
          />

          <div className="pt-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                type="submit"
                disabled={formSubmission.isSubmitting || zineForm.zines.length === 0}
                className="flex-1 md:flex-none"
              >
                {formSubmission.isSubmitting ? "Enviando..." : `Enviar ${zineForm.zines.length} Zine${zineForm.zines.length !== 1 ? 's' : ''}`}
              </Button>
              
              {hasFormData && (
                <ActionButton
                  type="button"
                  variant="secondary"
                  onClick={handleClearForm}
                  disabled={formSubmission.isSubmitting}
                >
                  Limpar Formulário
                </ActionButton>
              )}
            </div>
            
            {zineForm.zines.length === 0 && (
              <p className="text-sm text-neutral-600">
                Adicione pelo menos uma zine para enviar o formulário
              </p>
            )}
          </div>
        </form>

        <footer className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-600">
          <p>Valeu! 🎉</p>
        </footer>
      </div>
    </main>
  );
}
