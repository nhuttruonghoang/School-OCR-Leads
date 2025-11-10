import React, { useState } from 'react';
import type { StudentData } from '../types';
import { CSV_HEADERS_KEYS, DISPLAY_HEADERS } from '../constants';

interface ResultsTableProps {
  data: StudentData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const convertToCSV = (dataToConvert: StudentData[]): string => {
    const header = CSV_HEADERS_KEYS.map(key => `"${DISPLAY_HEADERS[key]}"`).join(',');
    const rows = dataToConvert.map(row => {
      return CSV_HEADERS_KEYS.map(key => {
        const value = row[key];
        // Escape double quotes by doubling them, and wrap in double quotes
        const escapedValue = value ? value.toString().replace(/"/g, '""') : '';
        return `"${escapedValue}"`;
      }).join(',');
    });
    // Add BOM for better Excel compatibility
    return '\uFEFF' + [header, ...rows].join('\n');
  };

  const handleCopy = () => {
    const csvData = convertToCSV(data);
    navigator.clipboard.writeText(csvData).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  const handleDownload = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'hsu_leads_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download CSV
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center gap-2"
        >
           {copyStatus === 'copied' ? (
             <>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
             </svg>
             Copied!
             </>
           ) : (
            <>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy as CSV
            </>
           )}
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {CSV_HEADERS_KEYS.map((key) => (
                <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {DISPLAY_HEADERS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {CSV_HEADERS_KEYS.map(key => (
                  <td key={`${key}-${index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
         <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No data extracted.
         </div>
      )}
    </div>
  );
};