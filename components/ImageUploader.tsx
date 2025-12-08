import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { FileWithPreview } from '../types';
import { FILE_CONFIG } from '../constants';

interface ImageUploaderProps {
  label: string;
  description: string;
  image: FileWithPreview | null;
  onImageChange: (image: FileWithPreview | null) => void;
  id: string;
  isLoading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  image,
  onImageChange,
  id,
  isLoading = false
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setError(null);

      if (file) {
        if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type as typeof FILE_CONFIG.ALLOWED_TYPES[number])) {
            setError("Invalid file format. Please upload JPG, PNG, or WebP.");
            return;
        }

        if (file.size > FILE_CONFIG.MAX_SIZE_BYTES) {
            setError(`File size exceeds ${FILE_CONFIG.MAX_SIZE_MB}MB limit.`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          onImageChange({
            file,
            preview: URL.createObjectURL(file),
            base64: reader.result as string,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageChange]
  );

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageChange(null);
    setError(null);
  }, [onImageChange]);

  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2 w-full" role="group" aria-labelledby={`${id}-label`}>
      <label
        id={`${id}-label`}
        className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2"
      >
        {label}
      </label>
      <p id={descriptionId} className="sr-only">{description}</p>
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out overflow-hidden ${
          error
            ? 'border-red-500 bg-red-500/10'
            : image
            ? 'border-indigo-500 bg-slate-800'
            : isLoading
                ? 'border-slate-600 bg-slate-800/80'
                : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-400'
        }`}
        role="region"
        aria-label={`${label} upload area`}
      >
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center w-full h-full animate-pulse"
            role="status"
            aria-label="Loading image"
          >
            <div className="w-16 h-16 bg-slate-700/50 rounded-full mb-4 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-500 animate-spin" aria-hidden="true" />
            </div>
            <div className="w-32 h-4 bg-slate-700/50 rounded mb-2"></div>
            <div className="w-24 h-3 bg-slate-700/30 rounded"></div>
            <span className="sr-only">Loading...</span>
          </div>
        ) : image ? (
          <div className="relative w-full h-full p-2">
            <img
              src={image.preview}
              alt={`Uploaded ${label} preview`}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <button
                    onClick={handleRemove}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
                    aria-label={`Remove ${label}`}
                    type="button"
                >
                    <X size={24} aria-hidden="true" />
                </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 rounded-xl"
          >
            {error ? (
                <div className="mb-4 p-4 bg-red-500/20 rounded-full text-red-400" aria-hidden="true">
                    <AlertCircle size={32} />
                </div>
            ) : (
                <div className="mb-4 p-4 bg-slate-700/50 rounded-full text-indigo-400 group-hover:scale-110 transition-transform" aria-hidden="true">
                <Upload size={32} />
                </div>
            )}

            <p className={`mb-2 text-lg font-medium text-center ${error ? 'text-red-300' : 'text-slate-200'}`}>
                {error ? 'Upload Failed' : 'Click to upload'}
            </p>
            <p
              id={error ? errorId : undefined}
              className={`text-xs text-center max-w-[200px] leading-relaxed ${error ? 'text-red-400' : 'text-slate-400'}`}
              role={error ? 'alert' : undefined}
            >
              {error || description}
            </p>
            <input
              id={id}
              type="file"
              className="sr-only"
              accept={FILE_CONFIG.ALLOWED_TYPES.join(',')}
              onChange={handleFileChange}
              aria-label={label}
              aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
              aria-invalid={error ? 'true' : 'false'}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
