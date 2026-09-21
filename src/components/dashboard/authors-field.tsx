import { Control, Controller } from "react-hook-form";
import { EditUploadFormData } from "@/schemas/edit-upload";
import { Author } from "@/schemas/apply-zine";
import { useAuthorsListEditor } from "@/hooks/use-authors-list-editor";
import AuthorForm from "@/components/apply-zine/author-form";
import ActionButton from "@/components/ui/action-button";

interface AuthorsFieldProps {
  control: Control<EditUploadFormData>;
  disabled?: boolean;
  legacyLinksNotice?: string | null;
}

export default function AuthorsField({ control, disabled, legacyLinksNotice }: AuthorsFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Autores *
      </label>
      {legacyLinksNotice && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
          ⚠️ Envio antigo: não sabemos de qual autor é cada link, então os campos
          abaixo começam vazios. Links originais para conferência: {legacyLinksNotice}
        </p>
      )}
      <Controller
        name="authors"
        control={control}
        render={({ field, fieldState }) => (
          <AuthorsListEditor
            authors={field.value || []}
            onChange={field.onChange}
            disabled={disabled}
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}

interface AuthorsListEditorProps {
  authors: Author[];
  onChange: (authors: Author[]) => void;
  disabled?: boolean;
  error?: string;
}

function AuthorsListEditor({ authors, onChange, disabled, error }: AuthorsListEditorProps) {
  const {
    addAuthor,
    removeAuthor,
    updateAuthorName,
    addSocialLinkToAuthor,
    removeSocialLinkFromAuthor,
    updateAuthorSocialLink,
  } = useAuthorsListEditor(authors, onChange);

  return (
    <div className="space-y-3">
      {authors.map((author, authorIndex) => (
        <AuthorForm
          key={authorIndex}
          author={author}
          authorIndex={authorIndex}
          isRemovable={authors.length > 1}
          disabled={disabled}
          onUpdateName={updateAuthorName}
          onAddSocialLink={addSocialLinkToAuthor}
          onRemoveSocialLink={removeSocialLinkFromAuthor}
          onUpdateSocialLink={updateAuthorSocialLink}
          onRemoveAuthor={removeAuthor}
        />
      ))}
      <ActionButton
        type="button"
        variant="secondary"
        size="sm"
        onClick={addAuthor}
        disabled={disabled}
      >
        + Adicionar outro autor
      </ActionButton>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
