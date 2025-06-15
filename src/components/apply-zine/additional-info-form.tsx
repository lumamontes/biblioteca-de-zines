import FormSection from "@/components/ui/form-section";
import Input from "@/components/ui/input";

interface AdditionalInfoFormProps {
  telegramInterest: string;
  contactEmail: string;
  onTelegramInterestChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  disabled?: boolean;
}

const telegramOptions = [
  { value: "sim", label: "Sim, quero participar!" },
  { value: "nao", label: "Não, obrigado" },
  { value: "talvez", label: "Talvez mais tarde" },
];

export default function AdditionalInfoForm({
  telegramInterest,
  contactEmail,
  onTelegramInterestChange,
  onContactEmailChange,
  disabled = false,
}: AdditionalInfoFormProps) {
  return (
    <FormSection title="Informações Adicionais">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Gostaria de participar do grupo do Telegram da Biblioteca de Zines?
          </label>
          <div className="space-y-2">
            {telegramOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="telegramInterest"
                  value={option.value}
                  checked={telegramInterest === option.value}
                  onChange={(e) => onTelegramInterestChange(e.target.value)}
                  className="mr-2"
                  disabled={disabled}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <Input
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