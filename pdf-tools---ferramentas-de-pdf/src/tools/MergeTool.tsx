import React, { useState } from 'react';
import { FileText, ArrowUp, ArrowDown, Trash2, Plus, Combine, AlertCircle } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { ProgressBar } from '../components/ProgressBar';
import { ResultDownload } from '../components/ResultDownload';
import { mergePdfs } from '../utils/pdfOperations';
import { formatBytes } from '../utils/pdfRender';
import { ProcessedResult, ProcessingState } from '../types';

export const MergeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcessMerge = async () => {
    if (files.length < 2) {
      setError('Por favor, adicione pelo menos 2 arquivos PDF para juntar.');
      return;
    }

    try {
      setState('processing');
      setProgress(5);
      setError(null);

      const res = await mergePdfs(files, (p, msg) => {
        setProgress(p);
        setProgressMsg(msg);
      });

      setResult(res);
      setState('completed');
    } catch (err: any) {
      console.error('Merge error:', err);
      setError(err?.message || 'Falha ao juntar os arquivos PDF. Verifique se algum deles está protegido por senha.');
      setState('idle');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setState('idle');
    setProgress(0);
    setError(null);
  };

  if (state === 'completed' && result) {
    return <ResultDownload result={result} toolTitle="Juntar PDFs" onReset={handleReset} />;
  }

  if (state === 'processing') {
    return <ProgressBar progress={progress} message={progressMsg} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Description header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">Juntar Arquivos PDF</h2>
        <p className="text-sm text-[#636E72]">
          Selecione múltiplos PDFs, organize a ordem desejada e combine tudo em um único documento.
        </p>
      </div>

      {/* Files dropzone if no files yet */}
      {files.length === 0 ? (
        <Dropzone
          accept={['application/pdf', '.pdf']}
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Arraste seus PDFs aqui"
          subtitle="Selecione 2 ou mais arquivos PDF para combinar"
        />
      ) : (
        <div className="space-y-4">
          {/* File list header & Add more button */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#4A5558]">
              {files.length} {files.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'} (
              {formatBytes(files.reduce((acc, f) => acc + f.size, 0))})
            </span>

            <label className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#244E39] bg-[#EAF1EC] hover:bg-[#DCE7E1] border border-[#D0DFD5] px-3.5 py-1.5 rounded-xl cursor-pointer transition shadow-2xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Mais PDFs</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                }}
              />
            </label>
          </div>

          {/* Files List with Reordering */}
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3.5 bg-white border border-[#E2E6DE] rounded-xl shadow-2xs hover:border-[#CBD2C8] transition"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <span className="w-6 text-center font-mono font-bold text-xs text-[#8C9A9E]">
                    {idx + 1}
                  </span>
                  <div className="p-2 bg-[#EAF1EC] text-[#2D5A43] rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2D3436] truncate">{file.name}</p>
                    <p className="text-xs text-[#8C9A9E]">{formatBytes(file.size)}</p>
                  </div>
                </div>

                {/* Reorder & Remove Controls */}
                <div className="flex items-center space-x-1 pl-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1.5 text-[#8C9A9E] hover:text-[#2D3436] disabled:opacity-30 rounded hover:bg-[#EEF1EB] transition cursor-pointer"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === files.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1.5 text-[#8C9A9E] hover:text-[#2D3436] disabled:opacity-30 rounded hover:bg-[#EEF1EB] transition cursor-pointer"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1.5 text-[#B34A3E] hover:text-[#8E3228] hover:bg-[#FDF2F0] rounded transition cursor-pointer ml-1"
                    title="Remover arquivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#636E72] hover:text-[#2D3436] py-2 cursor-pointer"
            >
              Limpar lista
            </button>

            <button
              id="btn-merge-action"
              type="button"
              disabled={files.length < 2}
              onClick={handleProcessMerge}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#2D5A43] hover:bg-[#224533] active:bg-[#1E3E2E] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Combine className="w-5 h-5" />
              <span>Juntar {files.length} PDFs</span>
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
