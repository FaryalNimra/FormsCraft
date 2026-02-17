'use client';

import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';
import { useRef, useState } from 'react';

interface FileUploadProps {
  id: string;
  label: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  id,
  label,
  required = false,
  value,
  onChange,
  error,
  accept = 'image/*,.pdf',
  maxSizeMB = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    setLocalError(null);

    if (file) {
      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setLocalError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setLocalError('Only images (JPG, PNG, GIF, WebP) and PDF files are allowed');
        return;
      }
    }

    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={24} className="text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText size={24} className="text-red-500" />;
    }
    return <File size={24} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const displayError = error || localError;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">


      <p className="text-lg font-semibold text-gray-900 mb-4 break-words">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : displayError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
        >
          <Upload size={32} className={dragActive ? 'text-blue-500' : 'text-black font-bold'} />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">
              Click or drag file to upload
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, JPG, PNG up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {getFileIcon(value)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{value.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {displayError && (
        <p className="mt-3 text-sm text-red-500 font-medium">{displayError}</p>
      )}
    </div>
  );
}
