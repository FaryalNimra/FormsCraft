'use client';

import { Upload, X, FileText, Image as ImageIcon, File, XCircle } from 'lucide-react';
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
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      if (!allowedTypes.includes(file.type)) {
        setLocalError('Invalid file type. Allowed: JPG, PNG, GIF, WebP, PDF, Word, Excel, and Text files');
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
    const type = file.type;
    if (type.startsWith('image/')) {
      return <ImageIcon size={24} className="text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText size={24} className="text-red-500" />;
    } else if (
      type === 'application/msword' ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'text/plain'
    ) {
      return <FileText size={24} className="text-blue-600" />;
    } else if (
      type === 'application/vnd.ms-excel' ||
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return <File size={24} className="text-green-600" />;
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
    <div className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${displayError ? 'border-red-500 ring-4 ring-red-50 animate-shake' : 'border-gray-100'}`}>


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
          <Upload size={32} className={dragActive ? 'text-blue-500' : displayError ? 'text-red-400' : 'text-black font-bold'} />
          <div className="text-center">
            <p className={`text-base font-semibold ${displayError ? 'text-red-900' : 'text-gray-600'}`}>
              Click or drag file to upload
            </p>
            <p className={`text-sm mt-1 ${displayError ? 'text-red-400' : 'text-gray-400'}`}>
              Images, PDF, Word, Excel up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className={`flex items-center gap-4 p-4 bg-gray-50 rounded-xl border ${displayError ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
          {getFileIcon(value)}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">{value.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(value.size)}</p>
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
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-red-800 font-bold leading-none mb-1">Upload Error</p>
            <p className="text-xs text-red-600 font-medium">{displayError}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
