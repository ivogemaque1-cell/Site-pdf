import React, { useState } from 'react';
import { Trash2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ProgressBar } from '../components/ProgressBar';
import { ResultDownload } from '../components/ResultDownload';
import { generatePdfThumbnails, formatBytes } from '../utils/pdfRender';
import { removePagesFromPdf } from '../utils/pdfOperations';
import { PDFPageInfo, ProcessedResult, ProcessingState } from '../types';

export const RemovePagesTool: React.FC = () => {
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
    setProgressMsg('Gerando miniaturas do documento...');

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

  const handleToggleRemovePage = (pageNum: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNum ? { ...p, markedForRemoval: !p.markedForRemoval } : p
      )
    );
  };

  const handleSelectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, markedForRemoval: true })));
  };

  const handleClearAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, markedForRemoval: false })));
  };

  const handleProcessRemove = async () => {
    if (!file) return;
    const pagesToRemove = pages.filter((p) => p.markedForRemoval).map((p) => p.pageNumber);

    if (pagesToRemove.length === 0) {
      setError('Selecione pelo menos 1 página para remover clicando nas miniaturas.');
      return;
    }

    if (pagesToRemove.length === pages.length) {
      setError('Você marcou todas as páginas para remoção. O documento precisa ter pelo menos 1 página.');
      return;
    }

    try {
      setState('processing');
      setError(null);
      setProgress(5);

      const res = await removePagesFromPdf(file, pagesToRemove, (p, msg) => {
        setProgress(p);
        setProgressMsg(msg);
      });

      setResult(res);
      setState('completed');
    } catch (err: any) {
      console.error('Remove pages error:', err);
      setError(err?.message || 'Erro ao remover páginas do PDF.');
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

  const removedCount = pages.filter((p) => p.markedForRemoval).length;
  const remainingCount = pages.length - removedCount;

  if (state === 'completed' && result) {
    return <ResultDownload result={result} toolTitle="Remover Páginas" onReset={handleReset} />;
  }

  if (state === 'processing') {
    return <ProgressBar progress={progress} message={progressMsg} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">Remover Páginas do PDF</h2>
        <p className="text-sm text-[#636E72]">
          Clique nas páginas que deseja excluir do seu documento e gere um novo PDF limpo.
        </p>
      </div>

      {!file ? (
        <Dropzone
          accept={['application/pdf', '.pdf']}
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Arraste o arquivo PDF aqui"
          subtitle="Visualize todas as páginas e exclua as que não precisa"
        />
      ) : (
        <div className="space-y-6">
          {/* File Card & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-[#E2E6DE] rounded-xl shadow-2xs gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-[#F7EDE8] text-[#C86D51] rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2D3436] truncate">{file.name}</p>
                <p className="text-xs text-[#8C9A9E]">
                  {formatBytes(file.size)} • Total de {pages.length} páginas
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right text-xs">
                <p className="font-semibold text-[#2D3436]">
                  Restarão: <span className="text-[#2D5A43] font-bold">{remainingCount}</span> páginas
                </p>
                <p className="text-[#C86D51] font-medium">{removedCount} marcadas para exclusão</p>
              </div>

              <button
                onClick={handleReset}
                className="text-xs text-[#636E72] hover:text-[#2D3436] font-medium px-3.5 py-1.5 rounded-lg border border-[#DFE3DA] hover:bg-[#EEF1EB] transition cursor-pointer"
              >
                Trocar arquivo
              </button>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#EBE4D8] text-[#785E3A] text-xs px-4 py-2.5 rounded-xl">
            💡 <strong>Instrução:</strong> Clique sobre qualquer página para marcar ou desmarcar para remoção.
          </div>

          {/* Visual Page Thumbnails Grid in Remove mode */}
          {state === 'loading_preview' ? (
            <div className="text-center py-12 text-[#8C9A9E]">Carregando miniaturas...</div>
          ) : (
            <PageThumbnailGrid
              pages={pages}
              mode="remove"
              onToggleRemove={handleToggleRemovePage}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
            />
          )}

          {/* Process Action */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-remove-pages-action"
              type="button"
              disabled={removedCount === 0 || remainingCount === 0}
              onClick={handleProcessRemove}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#C86D51] hover:bg-[#B3593D] active:bg-[#9B482E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Trash2 className="w-5 h-5" />
              <span>Remover {removedCount} {removedCount === 1 ? 'Página' : 'Páginas'}</span>
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
