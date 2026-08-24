import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageInfo } from '../types';

// Configure worker
try {
  // Use unpkg CDN matching version or fallback to avoid bundling issues
  const version = pdfjsLib.version || '4.0.379';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('Could not set pdf.workerSrc', e);
}

/**
 * Load a PDF document from a File or Uint8Array
 */
export async function loadPdfDocument(fileOrData: File | Uint8Array | ArrayBuffer) {
  let arrayBuffer: ArrayBuffer;
  if (fileOrData instanceof File) {
    arrayBuffer = await fileOrData.arrayBuffer();
  } else if (fileOrData instanceof Uint8Array) {
    arrayBuffer = fileOrData.buffer as ArrayBuffer;
  } else {
    arrayBuffer = fileOrData;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/cmaps/',
    cMapPacked: true,
  });

  return await loadingTask.promise;
}

/**
 * Get total page count of a PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const pdf = await loadPdfDocument(file);
    return pdf.numPages;
  } catch (error) {
    console.error('Error getting page count:', error);
    throw new Error('Não foi possível ler o arquivo PDF. Verifique se o arquivo não está corrompido ou protegido por senha.');
  }
}

/**
 * Render a single PDF page to a canvas
 */
export async function renderPageToCanvas(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 1.0,
  rotationOffset: number = 0
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale, rotation: (page.rotate + rotationOffset) % 360 });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    throw new Error('Canvas context not available');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const renderContext = {
    canvas,
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  return canvas;
}

/**
 * Generate thumbnails for all pages of a PDF
 */
export async function generatePdfThumbnails(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PDFPageInfo[]> {
  const pdf = await loadPdfDocument(file);
  const totalPages = pdf.numPages;
  const pages: PDFPageInfo[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    try {
      // Scale down for thumbnail
      const canvas = await renderPageToCanvas(pdf, pageNum, 0.4);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);

      pages.push({
        pageNumber: pageNum,
        thumbnailUrl,
        rotation: 0,
        selected: false,
        markedForRemoval: false,
        width: canvas.width,
        height: canvas.height,
      });

      if (onProgress) {
        onProgress(pageNum, totalPages);
      }
    } catch (e) {
      console.warn(`Failed to render page ${pageNum} thumbnail:`, e);
      pages.push({
        pageNumber: pageNum,
        rotation: 0,
        selected: false,
        markedForRemoval: false,
      });
    }
  }

  return pages;
}

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
