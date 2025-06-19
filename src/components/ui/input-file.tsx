import { forwardRef, useCallback, useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, FileCheckIcon, File as FileIcon, FileTextIcon, ImageIcon } from 'lucide-react';
import { Label } from '@/ui/label';

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

interface FileProps {
  onFileAccepted: (file: File) => void;
  label?: string;
  accept?: FileAcceptType;
  className?: string;
}

const getCategory = (file: File) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  return 'other';
};

export const InputFile = forwardRef<HTMLDivElement, FileProps>(
  ({ onFileAccepted, label = 'Arraste um arquivo ou clique para selecionar', accept = '*', className = '' }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [preview, setPreview] = useState<{ url: string; category: 'image' | 'pdf' | 'other'; file: File } | null>(null);

    useEffect(() => {
      return () => {
        if (preview?.url) URL.revokeObjectURL(preview.url);
      };
    }, [preview]);

    const processFile = (file: File) => {
      const category = getCategory(file);
      const url = category === 'other' ? '' : URL.createObjectURL(file);
      setPreview({ url, category, file });
      setShowPreview(false);
      onFileAccepted(file);
    };

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.match(accept.replace('*', '.*'))) {
          processFile(file);
        }
      },
      [accept],
    );

    const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.match(accept.replace('*', '.*'))) {
        processFile(file);
      }
    };

    const renderInlinePreview = (): ReactNode => {
      if (!preview || !showPreview) return null;
      switch (preview.category) {
        case 'image':
          return <img src={preview.url} alt={preview.file.name} className="max-h-64 w-full object-contain rounded mt-4" />;
        case 'pdf':
          return <iframe src={preview.url} title={preview.file.name} className="w-full h-64 rounded mt-4" />;
        default:
          return null;
      }
    };

    return (
      <div>
        <div
          ref={ref}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`group relative border-2 rounded-lg p-6 cursor-pointer transition flex items-center justify-center text-center text-sm
    ${preview ? 'border-blue-500 bg-blue-50 text-blue-800' : isDragging ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600'}
    hover:border-blue-400 hover:bg-blue-50
    border-dashed ${className}`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleSelectFile}
            ref={inputRef}
            hidden
          />

          {preview ? (
            <FileCheckIcon className="animate-ring opacity-50 text-green-600 size-8" />
          ) : (
            <div className="group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex justify-center">
                {accept === 'image/*' && <ImageIcon className="size-8 opacity-50 text-blue-500" />}
                {accept === 'application/pdf' && <FileTextIcon className="size-8 opacity-50 text-red-500" />}
              </div>
              <Label className="text-neutral-500">{label}</Label>
            </div>
          )}
        </div>
        {preview && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="font-medium truncate flex items-center gap-1">
              <FileIcon className="size-4" /> {preview.file.name}
            </span>
            {preview.category !== 'other' ? (
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-1 text-foreground"
              >
                {showPreview ? (
                  <>
                    <ChevronUp className="size-4" /> <small className="text-xs">Ocultar</small>
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4 animate-pulse" /> <small className="text-xs">Preview</small>
                  </>
                )}
              </button>
            ) : (
              <span className="text-neutral-500 flex items-center gap-1">
                <FileIcon className="size-4" /> <small className="text-xs">Enviado</small>
              </span>
            )}
          </div>
        )}


        {renderInlinePreview()}
      </div>
    );
  },
);

InputFile.displayName = 'InputFile';
