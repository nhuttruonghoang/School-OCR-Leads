import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Set worker source for pdf.js
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const pdfToImages = async (
  file: File,
  onProgress: (progress: { currentPage: number; totalPages: number }) => void
): Promise<string[]> => {
  const images: string[] = [];
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read PDF file."));
      }
      
      const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
      
      try {
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const totalPages = pdf.numPages;
        onProgress({ currentPage: 0, totalPages });

        for (let i = 1; i <= totalPages; i++) {
          onProgress({ currentPage: i, totalPages });
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
             console.warn(`Could not get canvas context for page ${i}`);
             continue;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Quality 0.9
          // remove data:image/jpeg;base64, prefix
          images.push(dataUrl.split(',')[1]); 
        }
        resolve(images);
      } catch (error) {
        console.error('Error processing PDF:', error);
        reject(new Error('Could not process the PDF file. It might be corrupted or in an unsupported format.'));
      }
    };
    
    fileReader.onerror = (error) => {
      reject(error);
    }

    fileReader.readAsArrayBuffer(file);
  });
};