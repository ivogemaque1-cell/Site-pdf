import React, { useState } from 'react';
import { RotateCw, RotateCcw, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ProgressBar } from '../components/ProgressBar';
import { ResultDownload } from '../components/ResultDownload';
import { generatePdfThumbnails, formatBytes } from '../utils/pdfRender';
import { rotatePdfPages } from '../utils/pdfOperations';
import { PDFPageInfo, ProcessedResult, ProcessingState } from '../types';

export const RotatePagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPageInfo[]>([]);
  const [state, setState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setError(null);
    setState('loading_preview');
    setProgressMsg('Carregando páginas do documento...');

    try {
      const loadedPages = await generatePdfThumbnails(selectedFile);
      setPages(loadedPages);
      setState('ready');
    } catch (err: any) {
      console.error('Failed to load PDF preview:', err);
      setError('Não foi possível ler o arquivo PDF. Verifique se o arquivo não está corrompido ou protegido por senha.');
      setState('idle');
    }
  };

  const handleRotateSinglePage = (pageNum: number, direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : 270;
    setPages((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNum
          ? { ...p, rotation: (p.rotation + delta) % 360 }
          : p
      )
    );
  };

  const handleRotateAll = (direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : 270;
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + delta) % 360,
      }))
    );
  };

  const handleProcessRotate = async () => {
    if (!file) return;

    // Check if any page was rotated
    const hasRotations = pages.some((p) => p.rotation !== 0);
    if (!hasRotations) {
      setError('Gire pelo menos uma página antes de salvar.');
      return;
    }

    try {
      setState('processing');
      setError(null);
      setProgress(5);

      const pageRotations: Record<number, number> = {};
      pages.forEach((p) => {
        if (p.rotation !== 0) {
          pageRotations[p.pageNumber] = p.rotation;
        }
      });

      const res = await rotatePdfPages(file, pageRotations, (p, msg) => {
        setProgress(p);
        setProgressMsg(msg);
      });

      setResult(res);
      setState('completed');
    } catch (err: any) {
      console.error('Rotate error:', err);
      setError(err?.message || 'Erro ao rotacionar páginas do PDF.');
      setState('ready');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setResult(null);
    setState('idle');
    setProgress(0);
    setError(null);
  };

  const rotatedCount = pages.filter((p) => p.rotation !== 0).length;

  if (state === 'completed' && result) {
    return <ResultDownload result={result} toolTitle="Rotacionar Páginas" onReset={handleReset} />;
  }

  if (state === 'processing') {
    return <ProgressBar progress={progress} message={progressMsg} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">Rotacionar Páginas do PDF</h2>
        <p className="text-sm text-[#636E72]">
          Gire páginas individuais ou todas as páginas de uma vez em 90°, 180° ou 270°.
        </p>
      </div>

      {!file ? (
        <Dropzone
          accept={['application/pdf', '.pdf']}
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Arraste o arquivo PDF aqui"
          subtitle="Gire e corrija a orientação das páginas do documento"
        />
      ) : (
        <div className="space-y-6">
          {/* File Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-[#E2E6DE] rounded-xl shadow-2xs gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-[#EEF1EB] text-[#4A5558] rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2D3436] truncate">{file.name}</p>
                <p className="text-xs text-[#8C9A9E]">
                  {formatBytes(file.size)} • {pages.length} páginas • {rotatedCount} rotacionada(s)
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-[#636E72] hover:text-[#2D3436] font-medium px-3.5 py-1.5 rounded-lg border border-[#DFE3DA] hover:bg-[#EEF1EB] transition cursor-pointer"
            >
              Trocar arquivo
            </button>
          </div>

          {/* Visual Page Thumbnails in Rotate Mode */}
          {state === 'loading_preview' ? (
            <div className="text-center py-12 text-[#8C9A9E]">Carregando miniaturas...</div>
          ) : (
            <PageThumbnailGrid
              pages={pages}
              mode="rotate"
              onRotatePage={handleRotateSinglePage}
              onRotateAll={handleRotateAll}
            />
          )}

          {/* Process Action */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-rotate-pages-action"
              type="button"
              disabled={rotatedCount === 0}
              onClick={handleProcessRotate}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#4A5558] hover:bg-[#384245] active:bg-[#2B3335] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl shadow-xs transition cursor-pointer"
            >
              <RotateCw className="w-5 h-5" />
              <span>Salvar com {rotatedCount} Rotações Aplicadas</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[#FDF2F0] border border-[#F5C6CB] text-[#9A2C2C] rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
