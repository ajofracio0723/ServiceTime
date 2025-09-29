import React, { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number; // optional client-side size guard
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  accept = '*/*',
  multiple = true,
  maxSizeBytes,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] => {
    if (!maxSizeBytes) return files;
    const valid: File[] = [];
    for (const f of files) {
      if (f.size <= maxSizeBytes) {
        valid.push(f);
      }
    }
    if (valid.length !== files.length) {
      setError('Some files exceeded the maximum allowed size and were skipped.');
      setTimeout(() => setError(null), 4000);
    }
    return valid;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const validated = validateFiles(files);
    if (validated.length > 0) {
      onFilesSelected(validated);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-center">
          <Upload className="w-6 h-6 mx-auto text-gray-500" />
          <p className="mt-2 text-sm text-gray-700">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-500">Accepted: {accept === '*/*' ? 'Any' : accept}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <div className="mt-2 text-xs text-red-600">{error}</div>
      )}
    </div>
  );
};
