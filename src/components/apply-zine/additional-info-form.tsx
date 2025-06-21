import FormSection from "@/components/ui/form-section";
import Input from "@/components/ui/input";

interface AdditionalInfoFormProps {
  contactEmail: string;
  onContactEmailChange: (value: string) => void;
  disabled?: boolean;
}

export default function AdditionalInfoForm({
  contactEmail,
  onContactEmailChange,
  disabled = false,
}: AdditionalInfoFormProps) {
  return (
    <FormSection title="Informações Adicionais">
      <div className="space-y-4">
        <Input
          id="contact-email"
          label="Email para Contato (opcional)"
          type="email"
          value={contactEmail}
          onChange={(e) => onContactEmailChange(e.target.value)}
          placeholder="seu@email.com"
          helperText="Caso queiramos entrar em contato sobre sua zine"
          disabled={disabled}
        />
      </div>
    </FormSection>
  );
} 