import React, { useState, useCallback, useRef } from 'react';
import { CameraCapture } from './CameraCapture';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
  onClear: () => void;
  files: File[] | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded, onClear, files }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileCount = files ? files.length : 0;

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (fileList && fileList.length > 0) {
      const acceptedFiles = Array.from(fileList).filter(
        file => file.type.startsWith('image/') || file.type === 'application/pdf'
      );

      if (acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
      } else {
        // Optional: Add user feedback for invalid file types
      }
    }
  }, [onFilesAdded]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const handleCapture = (file: File) => {
    onFilesAdded([file]);
    setIsCameraOpen(false);
  };

  return (
    <>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          isDragging ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/*,application/pdf"
          className="hidden"
          multiple
        />
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap justify-center items-center gap-2">
            <button type="button" onClick={handleUploadClick} className="font-semibold text-primary-600 hover:underline focus:outline-none">Click to upload</button>
            <span>or drag and drop</span>
          </div>
           <button 
            type="button" 
            onClick={() => setIsCameraOpen(true)}
            className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-900/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
            Chụp ảnh
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">PDF, PNG, JPG, or WEBP</p>
          {fileCount > 0 && (
            <div className="mt-4 flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {fileCount} {fileCount === 1 ? 'file' : 'files'} selected
                </p>
                <button type="button" onClick={onClear} className="text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    Clear
                </button>
            </div>
          )}
        </div>
      </div>
      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}
    </>
  );
};