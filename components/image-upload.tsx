'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
}

export function ImageUpload({ onImagesSelect, maxFiles = 5, existingImages = [], onRemoveExisting }: ImageUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newPreviews = acceptedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      const updated = [...previews, ...newPreviews].slice(0, maxFiles);
      setPreviews(updated);
      onImagesSelect(updated.map((p) => p.file));
    },
    [previews, maxFiles, onImagesSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  function removePreview(index: number) {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onImagesSelect(updated.map((p) => p.file));
  }

  return (
    <div className="w-full">
      <p className="block text-sm font-medium text-gray-700 mb-1">Preview Images</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {existingImages.map((url) => (
          <div key={url} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
            <img src={url} alt="" className="w-full h-full object-cover" />
            {onRemoveExisting && (
              <button
                type="button"
                onClick={() => onRemoveExisting(url)}
                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 hover:bg-red-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {previews.map((preview, i) => (
          <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
            <img src={preview.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePreview(i)}
              className="absolute top-1 right-1 bg-white/90 rounded-full p-1 hover:bg-red-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      {existingImages.length + previews.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-gold bg-gold/5' : 'border-gray-300 hover:border-gold/50'
          )}
        >
          <input {...getInputProps()} />
          <ImagePlus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
          <p className="text-sm text-gray-600">Add preview images</p>
          <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB each</p>
        </div>
      )}
    </div>
  );
}
