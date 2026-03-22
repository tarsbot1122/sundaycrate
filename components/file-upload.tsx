'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  currentFile?: string | null;
}

export function FileUpload({ onFileSelect, accept, maxSize = 50 * 1024 * 1024, label, currentFile }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        setError('File type not accepted or file is too large');
        return;
      }
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div className="w-full">
      {label && <p className="block text-sm font-medium text-gray-700 mb-1">{label}</p>}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-gold bg-gold/5' : 'border-gray-300 hover:border-gold/50',
          error && 'border-red-400'
        )}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileIcon className="h-5 w-5 text-navy" />
            <span className="text-sm text-navy font-medium">{file.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : currentFile ? (
          <div className="flex items-center justify-center gap-2">
            <FileIcon className="h-5 w-5 text-navy" />
            <span className="text-sm text-gray-500">Current file uploaded. Drop a new file to replace.</span>
          </div>
        ) : (
          <div>
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Max file size: {Math.round(maxSize / 1024 / 1024)}MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
