import React, { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi'],
  maxSize = 50 * 1024 * 1024, // 50MB
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): { valid: boolean; error?: string } => {
    if (files.length > maxFiles) {
      return { valid: false, error: `Maximum ${maxFiles} files allowed` };
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File "${file.name}" is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`
        };
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        if (type.startsWith('.')) {
          // Check file extension
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isValidType) {
        return {
          valid: false,
          error: `File "${file.name}" is not a supported type. Please upload images or videos.`
        };
      }
    }

    return { valid: true };
  };

  const handleFiles = useCallback((files: FileList) => {
    if (!files || files.length === 0) return;

    const validation = validateFiles(files);
    if (!validation.valid) {
      setError(validation.error || 'Invalid files');
      return;
    }

    setError('');
    onFilesSelected(files);
  }, [onFilesSelected, maxFiles, maxSize, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragOver && !disabled
            ? 'border-brass bg-brass/10 scale-105'
            : 'border-navy-dark/30 hover:border-brass hover:bg-brass/5'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-navy-dark/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              />
            </svg>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-lg font-semibold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              {isDragOver ? 'Drop your naval treasures here! ⚓' : 'Upload Battle Evidence'}
            </h3>
            <p className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>
              Drag and drop your images or videos here, or{' '}
              <span className="text-brass font-semibold underline">click to browse</span>
            </p>
            <p className="text-xs text-navy-dark/50 mt-2">
              Maximum {maxFiles} files • Up to {Math.round(maxSize / (1024 * 1024))}MB each
            </p>
            <p className="text-xs text-navy-dark/50">
              Supports: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, WebM, OGG)
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
