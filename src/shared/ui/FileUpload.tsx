/**
 * MST FileUpload Component - 2026 Edition
 * 
 * Drag & drop upload s preview.
 */

import React, { useState, useRef, useCallback } from 'react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface FileUploadProps {
  /** Accepted file types */
  accept?: string;
  /** Multiple files */
  multiple?: boolean;
  /** Max file size in bytes */
  maxSize?: number;
  /** Max files */
  maxFiles?: number;
  /** Callback při uploadu */
  onUpload: (files: File[]) => Promise<void>;
  /** Aktuální soubory */
  files?: UploadedFile[];
  /** Callback při odstranění */
  onRemove?: (fileId: string) => void;
  /** Label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Disabled */
  disabled?: boolean;
  /** Varianta */
  variant?: 'default' | 'compact' | 'avatar';
}

export function FileUpload({
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  onUpload,
  files = [],
  onRemove,
  label,
  helperText,
  disabled = false,
  variant = 'default',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: File[]): File[] => {
    setError(null);
    
    const validFiles: File[] = [];
    
    for (const file of fileList) {
      // Check max files
      if (validFiles.length + files.length >= maxFiles) {
        setError(`Maximální počet souborů je ${maxFiles}`);
        break;
      }
      
      // Check file size
      if (file.size > maxSize) {
        setError(`Soubor ${file.name} je příliš velký (max ${formatFileSize(maxSize)})`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  };

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    const validFiles = validateFiles(Array.from(fileList));
    if (validFiles.length > 0) {
      await onUpload(validFiles);
    }
  }, [onUpload, files.length, maxFiles, maxSize]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Avatar variant
  if (variant === 'avatar') {
    return (
      <div className="flex items-center gap-4">
        <div 
          onClick={handleClick}
          className={`
            relative w-20 h-20 rounded-full overflow-hidden
            bg-slate-100 dark:bg-slate-800
            border-2 border-dashed border-slate-300 dark:border-slate-600
            flex items-center justify-center
            cursor-pointer hover:border-brand-500 transition-colors
            ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {files[0]?.url ? (
            <img src={files[0].url} alt="" className="w-full h-full object-cover" />
          ) : (
            <CameraIcon className="w-8 h-8 text-slate-400" />
          )}
          
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
        
        <div>
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
          >
            Nahrát foto
          </button>
          {helperText && (
            <p className="text-xs text-slate-500 mt-1">{helperText}</p>
          )}
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 py-2
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            rounded-xl
            text-sm font-medium text-slate-700 dark:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-700
            transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <UploadIcon className="w-5 h-5" />
          Vybrat soubor
        </button>
        
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file) => (
              <FilePreview 
                key={file.id} 
                file={file} 
                onRemove={onRemove ? () => onRemove(file.id) : undefined}
                compact
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative
          border-2 border-dashed rounded-2xl
          p-8
          text-center
          transition-all duration-200
          ${isDragging 
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <UploadIcon className="w-7 h-7 text-slate-400" />
        </div>
        
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
          Přetáhněte soubory sem
        </p>
        <p className="text-sm text-slate-500">
          nebo <span className="text-brand-600 dark:text-brand-400">vyberte ze zařízení</span>
        </p>
        
        {helperText && (
          <p className="text-xs text-slate-400 mt-3">{helperText}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((file) => (
            <FilePreview 
              key={file.id} 
              file={file} 
              onRemove={onRemove ? () => onRemove(file.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * File Preview Component
 */
interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: () => void;
  compact?: boolean;
}

function FilePreview({ file, onRemove, compact = false }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <FileIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">
          {file.name}
        </span>
        <span className="text-xs text-slate-400">
          {formatFileSize(file.size)}
        </span>
        {onRemove && (
          <button 
            type="button"
            onClick={onRemove}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <XIcon className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
        {isImage && file.url ? (
          <img src={file.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileIcon className="w-7 h-7 text-slate-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-sm text-slate-500">
          {formatFileSize(file.size)}
          {file.status === 'error' && (
            <span className="text-error-600 dark:text-error-400 ml-2">
              • {file.error || 'Chyba nahrávání'}
            </span>
          )}
        </p>
        
        {/* Progress bar */}
        {file.status === 'uploading' && (
          <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Status & Remove */}
      <div className="flex items-center gap-2">
        {file.status === 'completed' && (
          <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-success-600 dark:text-success-400" />
          </div>
        )}
        
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <XIcon className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// Helpers
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Icons
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default FileUpload;
