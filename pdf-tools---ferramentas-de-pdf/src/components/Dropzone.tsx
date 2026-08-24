import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle, Plus, FileText } from 'lucide-react';
import { formatBytes } from '../utils/pdfRender';

interface DropzoneProps {
  accept: string[];
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  maxSizeMB?: number;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  accept,
  multiple = false,
  onFilesSelected,
  title,
  subtitle,
  maxSizeMB = 100,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const filesArray = Array.from(fileList);
    const validFiles: File[] = [];

    const isAcceptedType = (file: File) => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return accept.some((type) => {
        if (type.startsWith('.')) {
          return extension === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return file.type.startsWith(mainType);
        }
        return file.type === type;
      });
    };

    for (const file of filesArray) {
      if (accept.length > 0 && !isAcceptedType(file)) {
        setErrorMessage(`O arquivo "${file.name}" não é um tipo suportado (${accept.join(', ')}).`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`O arquivo "${file.name}" ultrapassa o limite de ${maxSizeMB}MB.`);
        return;
      }

      validFiles.push(file);
    }

    if (!multiple && validFiles.length > 1) {
      onFilesSelected([validFiles[0]]);
    } else if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    validateAndHandleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        id="dropzone-area"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-[#2D5A43] bg-[#EAF1EC] scale-[1.01]'
            : 'border-[#CBD2C8] hover:border-[#2D5A43] hover:bg-[#F2F4EF] bg-white'
        } shadow-xs`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={(e) => validateAndHandleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              isDragOver ? 'bg-[#2D5A43] text-white' : 'bg-[#EAF1EC] text-[#244E39]'
            }`}
          >
            <UploadCloud className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#2D3436]">
              {title || (multiple ? 'Arraste e solte seus arquivos aqui' : 'Arraste e solte o arquivo PDF aqui')}
            </h3>
            <p className="text-sm text-[#636E72] max-w-md mx-auto">
              {subtitle || 'ou clique para navegar no seu dispositivo'}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center space-x-2 bg-[#2D5A43] hover:bg-[#224533] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-2xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{multiple ? 'Selecionar Arquivos' : 'Selecionar Arquivo'}</span>
          </button>

          <div className="pt-2 text-xs text-[#8C9A9E]">
            <span>Suporta {accept.join(', ')} • Até {maxSizeMB}MB</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center space-x-2 p-3.5 bg-[#FDF2F0] border border-[#F5C6CB] text-[#9A2C2C] rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
