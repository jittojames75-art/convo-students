import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Configure PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

/**
 * Process an uploaded signature file (supports PDF, PNG, JPG, JPEG, SVG, WebP)
 * Converts to high-resolution PNG data URL for crisp rendering and print output.
 * @param {File} file 
 * @returns {Promise<string>} Data URL of the signature image
 */
export async function processSignatureFile(file) {
  if (!file) throw new Error('No file provided');

  const fileType = file.type?.toLowerCase() || '';
  const fileName = file.name?.toLowerCase() || '';
  const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

  if (isPdf) {
    return convertPdfPageToImage(file);
  }

  // Standard Image (PNG, JPG, SVG, WebP)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(new Error('Failed to read image file: ' + err));
    reader.readAsDataURL(file);
  });
}

/**
 * Render first page of PDF onto an offscreen canvas and return high-res PNG data URL
 */
async function convertPdfPageToImage(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  if (pdf.numPages < 1) {
    throw new Error('PDF has no pages');
  }

  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for sharp print quality

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };

  await page.render(renderContext).promise;

  // Optional: Trim excess white margins if needed or return clean data URL
  return canvas.toDataURL('image/png');
}
