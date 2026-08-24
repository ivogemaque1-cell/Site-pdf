import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { loadPdfDocument, renderPageToCanvas } from './pdfRender';
import { ProcessedResult } from '../types';

/**
 * 1. JUNTAR PDFs (Merge multiple PDFs)
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (progress: number, message: string) => void
): Promise<ProcessedResult> {
  if (files.length < 2) {
    throw new Error('Selecione pelo menos 2 arquivos PDF para juntar.');
  }

  onProgress?.(5, 'Iniciando criação do novo documento...');
  const mergedPdf = await PDFDocument.create();

  const totalFiles = files.length;
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    onProgress?.(
      Math.round(10 + (i / totalFiles) * 80),
      `Processando ${file.name} (${i + 1}/${totalFiles})...`
    );

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  onProgress?.(95, 'Gerando arquivo PDF final...');
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  onProgress?.(100, 'Concluído com sucesso!');

  const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

  return {
    fileName: 'documento_mesclado.pdf',
    blob,
    url,
    fileSize: blob.size,
    originalSize: originalTotalSize,
    type: 'pdf',
  };
}

/**
 * Parse page range string like "1-3, 5, 7-10" into 1-based page numbers
 */
export function parsePageRangeString(rangeStr: string, maxPages: number): number[] {
  const pagesSet = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          pagesSet.add(p);
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        pagesSet.add(p);
      }
    }
  }

  return Array.from(pagesSet).sort((a, b) => a - b);
}

/**
 * 2. DIVIDIR PDF (Split PDF into ranges or individual files)
 */
export async function splitPdf(
  file: File,
  options: {
    mode: 'extract_selected' | 'split_all' | 'custom_ranges';
    selectedPages?: number[];
    customRangeString?: string;
  },
  onProgress?: (progress: number, message: string) => void
): Promise<ProcessedResult> {
  onProgress?.(10, 'Carregando arquivo PDF original...');
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (options.mode === 'extract_selected') {
    const pagesToExtract = options.selectedPages && options.selectedPages.length > 0
      ? options.selectedPages
      : (options.customRangeString ? parsePageRangeString(options.customRangeString, totalPages) : [1]);

    if (pagesToExtract.length === 0) {
      throw new Error('Nenhuma página válida selecionada para extração.');
    }

    onProgress?.(30, `Extraindo ${pagesToExtract.length} página(s)...`);
    const newPdf = await PDFDocument.create();
    // 0-based indices for pdf-lib
    const indices = pagesToExtract.map((p) => p - 1).filter((idx) => idx >= 0 && idx < totalPages);
    const copiedPages = await newPdf.copyPages(srcDoc, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    onProgress?.(80, 'Salvando novo PDF...');
    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const baseName = file.name.replace(/\.pdf$/i, '');

    return {
      fileName: `${baseName}_extraido.pdf`,
      blob,
      url: URL.createObjectURL(blob),
      fileSize: blob.size,
      originalSize: file.size,
      type: 'pdf',
    };
  }

  // Split into individual pages or ranges and bundle in a ZIP
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, '');

  if (options.mode === 'split_all') {
    for (let i = 0; i < totalPages; i++) {
      onProgress?.(
        Math.round(20 + (i / totalPages) * 70),
        `Separando página ${i + 1} de ${totalPages}...`
      );
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(srcDoc, [i]);
      singlePagePdf.addPage(copiedPage);
      const bytes = await singlePagePdf.save();
      zip.file(`${baseName}_pagina_${i + 1}.pdf`, bytes);
    }
  } else if (options.mode === 'custom_ranges') {
    // Custom ranges split by comma e.g. "1-3, 4-6"
    const ranges = (options.customRangeString || '1').split(',').map((s) => s.trim()).filter(Boolean);
    for (let rIdx = 0; rIdx < ranges.length; rIdx++) {
      const rangeStr = ranges[rIdx];
      const pageList = parsePageRangeString(rangeStr, totalPages);
      if (pageList.length === 0) continue;

      onProgress?.(
        Math.round(20 + (rIdx / ranges.length) * 70),
        `Criando parte ${rIdx + 1}: páginas ${rangeStr}...`
      );

      const partPdf = await PDFDocument.create();
      const indices = pageList.map((p) => p - 1);
      const copiedPages = await partPdf.copyPages(srcDoc, indices);
      copiedPages.forEach((p) => partPdf.addPage(p));
      const bytes = await partPdf.save();
      zip.file(`${baseName}_parte_${rIdx + 1}_paginas_${rangeStr.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`, bytes);
    }
  }

  onProgress?.(92, 'Compactando arquivos em arquivo ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(92 + Math.round(metadata.percent * 0.07), `Gerando ZIP (${Math.round(metadata.percent)}%)...`);
  });

  return {
    fileName: `${baseName}_dividido.zip`,
    blob: zipBlob,
    url: URL.createObjectURL(zipBlob),
    fileSize: zipBlob.size,
    originalSize: file.size,
    type: 'zip',
  };
}

/**
 * 3. COMPRIMIR PDF (Client-side compression by rasterizing & optimizing pages)
 */
export async function compressPdf(
  file: File,
  qualityLevel: 'low' | 'medium' | 'high' = 'medium',
  onProgress?: (progress: number, message: string) => void
): Promise<ProcessedResult> {
  onProgress?.(10, 'Carregando documento para análise...');
  const pdfJsDoc = await loadPdfDocument(file);
  const totalPages = pdfJsDoc.numPages;

  // Settings based on level
  // 'low' quality = maximum compression (smallest file)
  // 'medium' quality = recommended balance
  // 'high' quality = light compression (highest fidelity)
  let scale = 1.0;
  let jpegQuality = 0.65;

  if (qualityLevel === 'low') {
    scale = 0.85;
    jpegQuality = 0.45;
  } else if (qualityLevel === 'medium') {
    scale = 1.1;
    jpegQuality = 0.65;
  } else {
    scale = 1.4;
    jpegQuality = 0.82;
  }

  onProgress?.(20, 'Otimizando páginas e reamostrando imagens...');
  const newPdf = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(
      Math.round(20 + (pageNum / totalPages) * 70),
      `Comprimindo página ${pageNum} de ${totalPages}...`
    );

    const canvas = await renderPageToCanvas(pdfJsDoc, pageNum, scale);
    const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
    const jpegBytes = await fetch(jpegDataUrl).then((res) => res.arrayBuffer());

    const embeddedImage = await newPdf.embedJpg(jpegBytes);
    const page = newPdf.addPage([canvas.width / scale, canvas.height / scale]);

    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: canvas.width / scale,
      height: canvas.height / scale,
    });
  }

  onProgress?.(95, 'Finalizando compressão...');
  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    fileName: `${baseName}_comprimido.pdf`,
    blob,
    url: URL.createObjectURL(blob),
    fileSize: blob.size,
    originalSize: file.size,
    type: 'pdf',
  };
}

/**
 * 4. CONVERTER PDF PARA IMAGENS (Export pages as JPG/PNG)
 */
export async function pdfToImages(
  file: File,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg',
  scale: number = 2.0,
  onProgress?: (progress: number, message: string) => void
): Promise<ProcessedResult> {
  onProgress?.(10, 'Carregando páginas do PDF...');
  const pdfJsDoc = await loadPdfDocument(file);
  const totalPages = pdfJsDoc.numPages;
  const ext = format === 'image/jpeg' ? 'jpg' : 'png';
  const baseName = file.name.replace(/\.pdf$/i, '');

  const images: { name: string; url: string; blob: Blob }[] = [];
  const zip = new JSZip();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(
      Math.round(15 + (pageNum / totalPages) * 75),
      `Renderizando página ${pageNum} de ${totalPages} em alta resolução...`
    );

    const canvas = await renderPageToCanvas(pdfJsDoc, pageNum, scale);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), format, format === 'image/jpeg' ? 0.92 : undefined);
    });

    const imgName = `${baseName}_pagina_${pageNum}.${ext}`;
    const imgUrl = URL.createObjectURL(blob);
    images.push({ name: imgName, url: imgUrl, blob });

    const arrayBuffer = await blob.arrayBuffer();
    zip.file(imgName, arrayBuffer);
  }

  onProgress?.(93, 'Empacotando imagens...');

  if (totalPages === 1) {
    // Single image directly
    const firstImg = images[0];
    return {
      fileName: firstImg.name,
      blob: firstImg.blob,
      url: firstImg.url,
      fileSize: firstImg.blob.size,
      originalSize: file.size,
      type: 'image',
      images,
    };
  }

  // Multiple images: provide ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return {
    fileName: `${baseName}_imagens.zip`,
    blob: zipBlob,
    url: URL.createObjectURL(zipBlob),
    fileSize: zipBlob.size,
    originalSize: file.size,
    type: 'zip',
    images,
  };
}

/**
 * 5. CONVERTER IMAGENS PARA PDF (Combine JPG/PNG into PDF)
 */
export async function imagesToPdf(
  files: File[],
  options: {
    pageSize?: 'fit' | 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape' | 'auto';
    margin?: number; // margin in points
  } = {},
  onProgress?: (progress: number, message: string) => void
): Promise<ProcessedResult> {
  if (files.length === 0) {
    throw new Error('Nenhuma imagem selecionada.');
  }

  onProgress?.(10, 'Iniciando criação do PDF a partir das imagens...');
  const pdfDoc = await PDFDocument.create();
  const totalFiles = files.length;
  const margin = options.margin ?? 10;
  const pageSizeOption = options.pageSize || 'fit';

  // Standard dimensions in points (72 points per inch)
  const A4 = { width: 595.28, height: 841.89 };
  const LETTER = { width: 612.0, height: 792.0 };

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    onProgress?.(
      Math.round(15 + (i / totalFiles) * 75),
      `Processando imagem ${i + 1} de ${totalFiles}: ${file.name}...`
    );

    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    let embeddedImage;
    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      }
    } catch (e) {
      // Fallback: draw on canvas and re-export as JPEG
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const jpgData = canvas.toDataURL('image/jpeg', 0.95);
      const res = await fetch(jpgData);
      const jpgBuf = await res.arrayBuffer();
      embeddedImage = await pdfDoc.embedJpg(jpgBuf);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = imgWidth;
    let pageHeight = imgHeight;

    if (pageSizeOption === 'fit') {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: margin,
        y: margin,
        width: imgWidth,
        height: imgHeight,
      });
    } else {
      const baseDim = pageSizeOption === 'a4' ? A4 : LETTER;
      let targetW = baseDim.width;
      let targetH = baseDim.height;

      if (options.orientation === 'landscape' || (options.orientation === 'auto' && imgWidth > imgHeight)) {
        targetW = baseDim.height;
        targetH = baseDim.width;
      }

      const page = pdfDoc.addPage([targetW, targetH]);
      const availW = targetW - margin * 2;
      const availH = targetH - margin * 2;

      const scale = Math.min(availW / imgWidth, availH / imgHeight, 1);
      const drawW = imgWidth * scale;
      const drawH = imgHeight * scale;
      const x = (targetW - drawW) / 2;
      const y = (targetH - drawH) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: drawW,
        height: drawH,
      });
    }
  }

  onProgress?.(95, 'Gerando arquivo PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const originalSize = files.reduce((acc, f) => acc + f.size, 0);

  return {
    fileName: 'imagens_convertidas.pdf',
    blob,
    url: URL.createObjectURL(blob),
    fileSize: blob.size,
    originalSize,
    type: 'pdf',
  };
}

/**
 * 6. REMOVER PÁGINAS (Exclude selected pages)
 */
export async function removePagesFromPdf(
  file: File,
  pageNumbersToRemove: number[],
  onProgress?: (progress: number, message: string) => void
): Promise<ProcessedResult> {
  onProgress?.(15, 'Carregando documento original...');
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const removeSet = new Set(pageNumbersToRemove);
  const remainingIndices: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (!removeSet.has(i)) {
      remainingIndices.push(i - 1);
    }
  }

  if (remainingIndices.length === 0) {
    throw new Error('Você removeu todas as páginas. O PDF precisa ter pelo menos 1 página restante.');
  }

  onProgress?.(50, `Mantendo ${remainingIndices.length} de ${totalPages} páginas...`);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcDoc, remainingIndices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  onProgress?.(90, 'Salvando novo PDF...');
  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    fileName: `${baseName}_paginas_removidas.pdf`,
    blob,
    url: URL.createObjectURL(blob),
    fileSize: blob.size,
    originalSize: file.size,
    type: 'pdf',
  };
}

/**
 * 7. ROTACIONAR PÁGINAS (Rotate specified or all pages by degrees)
 */
export async function rotatePdfPages(
  file: File,
  pageRotations: Record<number, number>, // 1-based page number -> extra angle (90, 180, 270)
  onProgress?: (progress: number, message: string) => void
): Promise<ProcessedResult> {
  onProgress?.(20, 'Carregando documento original...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(50, 'Aplicando rotações nas páginas...');
  const pages = pdfDoc.getPages();

  for (let i = 1; i <= totalPages; i++) {
    const extraRotation = pageRotations[i] || 0;
    if (extraRotation !== 0) {
      const page = pages[i - 1];
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + extraRotation) % 360;
      page.setRotation(degrees(newRotation));
    }
  }

  onProgress?.(90, 'Gerando arquivo com novas rotações...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    fileName: `${baseName}_rotacionado.pdf`,
    blob,
    url: URL.createObjectURL(blob),
    fileSize: blob.size,
    originalSize: file.size,
    type: 'pdf',
  };
}
