import { Author } from "@/schemas/apply-zine";
import ActionButton from "@/components/ui/action-button";
import Input from "@/components/ui/input";

interface AuthorFormProps {
  author: Author;
  authorIndex: number;
  isRemovable: boolean;
  onUpdateName: (index: number, name: string) => void;
  onAddSocialLink: (authorIndex: number) => void;
  onRemoveSocialLink: (authorIndex: number, linkIndex: number) => void;
  onUpdateSocialLink: (authorIndex: number, linkIndex: number, link: string) => void;
  onRemoveAuthor: (index: number) => void;
  disabled?: boolean;
}

export default function AuthorForm({
  author,
  authorIndex,
  isRemovable,
  onUpdateName,
  onAddSocialLink,
  onRemoveSocialLink,
  onUpdateSocialLink,
  onRemoveAuthor,
  disabled = false,
}: AuthorFormProps) {
  return (
    <div className="min-w-0 border border-neutral-200 p-4 rounded-lg bg-neutral-50">
      <div className="flex min-w-0 items-center justify-between mb-4">
        <h3 className="min-w-0 break-words text-lg font-medium">
          Autor {authorIndex + 1}
        </h3>
        {isRemovable && (
          <ActionButton
            type="button"
            variant="danger"
            size="sm"
            onClick={() => onRemoveAuthor(authorIndex)}
            disabled={disabled}
          >
            Remover Autor
          </ActionButton>
        )}
      </div>

      <div className="space-y-4">
        <Input
          id={`author-${authorIndex}-name`}
          label="Nome do Autor *"
          type="text"
          value={author.name}
          onChange={(e) => onUpdateName(authorIndex, e.target.value)}
          placeholder="Nome completo do autor"
          required
          disabled={disabled}
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Redes sociais (opcional)
          </label>
          <div className="space-y-2">
            {author.socialLinks.length === 0 ? (
                <div className="flex min-w-0 gap-2">
                <Input
                  id={`author-${authorIndex}-social-0`}
                  type="url"
                  value=""
                  onChange={(e) => onUpdateSocialLink(authorIndex, 0, e.target.value)}
                  placeholder="https://instagram.com/usuario"
                  className="min-w-0 flex-1"
                  disabled={disabled}
                />
              </div>
            ) : (
              author.socialLinks.map((link, linkIndex) => (
                <div key={linkIndex} className="flex min-w-0 gap-2">
                  <Input
                    id={`author-${authorIndex}-social-${linkIndex}`}
                    type="url"
                    value={link}
                    onChange={(e) => onUpdateSocialLink(authorIndex, linkIndex, e.target.value)}
                    placeholder="https://instagram.com/usuario"
                     className="min-w-0 flex-1"
                    disabled={disabled}
                  />
                  {author.socialLinks.length > 1 && (
                    <ActionButton
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => onRemoveSocialLink(authorIndex, linkIndex)}
                      disabled={disabled}
                    >
                      ×
                    </ActionButton>
                  )}
                </div>
              ))
            )}
            <ActionButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onAddSocialLink(authorIndex)}
              disabled={disabled}
            >
              + Adicionar Link Social
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
