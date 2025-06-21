import { forwardRef, useCallback, useRef, useState, useEffect, ReactNode } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileCheckIcon,
  File as FileIcon,
  FileTextIcon,
  ImageIcon,
} from 'lucide-react';
import { Label } from './label';

export type FileAcceptType =
  | 'image/*'
  | 'video/*'
  | 'audio/*'
  | 'application/pdf'
  | 'application/zip'
  | 'application/json'
  | 'text/*'
  | '.csv'
  | '.xlsx'
  | '.doc'
  | '.docx'
  | '.ppt'
  | '.pptx'
  | '.txt'
  | '.jpg'
  | '.jpeg'
  | '.png'
  | '.svg'
  | '*';

/**
 * Configurações opcionais para o componente InputFile.
 */
export interface InputFileConfig {
  /** Texto exibido antes de selecionar um arquivo */
  label?: string;
  /** Tipos de arquivo aceitos */
  accept?: FileAcceptType;
  /** Classes adicionais para estilização */
  className?: string;
  /** Permitir seleção de múltiplos arquivos */
  multiple?: boolean;
  /** Tamanho máximo em bytes */
  maxSize?: number;
  /** Desabilitar interações */
  disabled?: boolean;
  /** Texto de ajuda abaixo do componente */
  helperText?: ReactNode;
}

export interface InputFileProps {
  /** Callback quando arquivo(s) são aceitos */
  onFileAccepted: (file: File | File[]) => void;
  /** Callback em caso de rejeição */
  onFileRejected?: (message: string) => void;
  /** Objeto único de configurações */
  config?: InputFileConfig;
}

type Preview = {
  url: string;
  category: 'image' | 'pdf' | 'other';
  file: File;
};

const getCategory = (file: File): 'image' | 'pdf' | 'other' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  return 'other';
};

export const InputFile = forwardRef<HTMLDivElement, InputFileProps>(
  ({ onFileAccepted, onFileRejected, config = {} }, ref) => {
    const {
      label = 'Arraste ou clique para selecionar',
      accept = '*',
      className = '',
      multiple = false,
      maxSize,
      disabled = false,
      helperText,
    } = config;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previews, setPreviews] = useState<Preview[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
      return () => previews.forEach(p => URL.revokeObjectURL(p.url));
    }, [previews]);

    const processFiles = (files: FileList) => {
      const accepted: File[] = [];
      Array.from(files).forEach(file => {
        if (maxSize && file.size > maxSize) {
          onFileRejected?.(`O arquivo ${file.name} excede o tamanho máximo (${maxSize} bytes).`);
          return;
        }
        const category = getCategory(file);
        const url = category === 'other' ? '' : URL.createObjectURL(file);
        setPreviews(prev => [...prev, { url, category, file }]);
        accepted.push(file);
      });
      if (accepted.length) onFileAccepted(multiple ? accepted : accepted[0]);
      setShowPreview(true);
    };

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
      },
      [disabled, maxSize]
    );

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const files = e.target.files;
      if (files) processFiles(files);
    };

    const renderPreview = () => (
      showPreview &&
      previews.map((prev, idx) => {
        if (prev.category === 'image') {
          return (
            <img
              key={idx}
              src={prev.url}
              alt={prev.file.name}
              className="max-h-40 object-contain rounded mt-2"
            />
          );
        }
        if (prev.category === 'pdf') {
          return (
            <iframe
              key={idx}
              src={prev.url}
              title={prev.file.name}
              className="w-full h-40 rounded mt-2"
            />
          );
        }
        return (
          <div key={idx} className="mt-2 flex items-center gap-2">
            <FileIcon className="size-4" /> {prev.file.name}
          </div>
        );
      })
    );

    return (
      <div>
        <div
          ref={ref}
          onClick={() => !disabled && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`group relative border-2 rounded-lg p-6 cursor-pointer flex flex-col items-center text-center text-sm
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : previews.length
                ? 'border-green-500 bg-green-50 text-green-800'
                : isDragging
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600'}
            hover:border-blue-400 hover:bg-blue-50 border-dashed ${className}`}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleSelect}
            ref={inputRef}
            hidden
            disabled={disabled}
          />

          {!previews.length ? (
            <>
              <div className="flex justify-center mb-2">
                {accept.startsWith('image') && <ImageIcon className="size-8" />}
                {accept === 'application/pdf' && <FileTextIcon className="size-8" />}
                {!accept.startsWith('image') && accept !== 'application/pdf' && <FileIcon className="size-8" />}
              </div>
              <Label className="text-neutral-500">{label}</Label>
            </>
          ) : (
            <FileCheckIcon className="size-8 text-green-600" />
          )}
        </div>

        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}

        {previews.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              className="text-sm text-blue-600 flex items-center gap-1"
              onClick={() => setShowPreview(v => !v)}
            >
              {showPreview ? <><ChevronUp className="size-4" /> Ocultar Pré-visualização</> : <><ChevronDown className="size-4" /> Ver Pré-visualização</>}
            </button>
          </div>
        )}

        {renderPreview()}
      </div>
    );
  }
);

InputFile.displayName = 'InputFile';
