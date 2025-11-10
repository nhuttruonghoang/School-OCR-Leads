import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LogoIcon } from './components/LogoIcon';
import { extractDataFromFiles } from './services/geminiService';
import { pdfToImages, fileToBase64 } from './utils/fileUtils';
import type { StudentData } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [extractedData, setExtractedData] = useState<StudentData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  const handleFileChange = (selectedFiles: File[] | null) => {
    setFiles(selectedFiles);
    setExtractedData(null);
    setError(null);
    setProgressMessage(null);
  };

  const processFiles = useCallback(async () => {
    if (!files || files.length === 0) {
      setError("Please select one or more files first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setProgressMessage("Starting process...");

    try {
      let allImageParts: { mimeType: string; data: string }[] = [];

      for (const [index, file] of files.entries()) {
        const fileType = file.type;
        const totalFiles = files.length;
        const progressPrefix = totalFiles > 1 ? `[${index + 1}/${totalFiles}] ${file.name}: ` : '';

        if (fileType === 'application/pdf') {
          const handlePdfProgress = (progress: { currentPage: number; totalPages: number }) => {
            if (progress.totalPages > 0) {
              setProgressMessage(`${progressPrefix}Converting PDF... Page ${progress.currentPage} of ${progress.totalPages}`);
            }
          };
          const base64Images = await pdfToImages(file, handlePdfProgress);
          const imageParts = base64Images.map(data => ({ mimeType: 'image/jpeg', data }));
          allImageParts.push(...imageParts);
        } else if (fileType.startsWith('image/')) {
          setProgressMessage(`${progressPrefix}Preparing image...`);
          const base64Image = await fileToBase64(file);
          const cleanBase64 = base64Image.split(',')[1];
          allImageParts.push({ mimeType: file.type, data: cleanBase64 });
        } else {
          console.warn(`Skipping unsupported file type: ${file.name} (${fileType})`);
          continue;
        }
      }
      
      if (allImageParts.length === 0) {
        throw new Error("Could not extract any images from the provided file(s). Please check the file formats.");
      }

      const pageCount = allImageParts.length;
      const pageText = pageCount === 1 ? '1 image' : `${pageCount} pages/images`;
      setProgressMessage(`Analyzing your document(s) (${pageText}) with Gemini...`);

      const data = await extractDataFromFiles(allImageParts);
      setExtractedData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during processing.");
    } finally {
      setIsLoading(false);
      setProgressMessage(null);
    }
  }, [files]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <LogoIcon className="h-12 w-12 text-primary-600" />
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              HSU Leads OCR Tool
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Upload student data files (PDF/Image) and extract information into a clean CSV format.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            <FileUpload onFileChange={handleFileChange} />
            
            <div className="flex justify-center">
              <button
                onClick={processFiles}
                disabled={!files || files.length === 0 || isLoading}
                className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Processing...' : 'Extract Data'}
              </button>
            </div>
          </div>
          
          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                {progressMessage || 'Processing...'}
                 <br />
                <span className="text-sm font-normal">
                  This might take a moment, especially for large or multiple files.
                </span>
              </p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {extractedData && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4 text-center">Extraction Results</h2>
              <ResultsTable data={extractedData} />
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} HSU Leads OCR Tool. Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;