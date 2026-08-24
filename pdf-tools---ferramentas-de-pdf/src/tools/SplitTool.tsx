import React, { useState } from 'react';
import { Split, AlertCircle, FileText, CheckSquare, Layers, Scissors } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ProgressBar } from '../components/ProgressBar';
import { ResultDownload } from '../components/ResultDownload';
import { generatePdfThumbnails, formatBytes } from '../utils/pdfRender';
import { splitPdf, parsePageRangeString } from '../utils/pdfOperations';
import { PDFPageInfo, ProcessedResult, ProcessingState } from '../types';

export const SplitTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPageInfo[]>([]);
  const [splitMode, setSplitMode] = useState<'extract_selected' | 'split_all' | 'custom_ranges'>('extract_selected');
  const [rangeInput, setRangeInput] = useState<string>('1');
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
    setProgressMsg('Carregando miniaturas das páginas...');

    try {
      const loadedPages = await generatePdfThumbnails(selectedFile);
      // Select first page by default
      if (loadedPages.length > 0) {
        loadedPages[0].selected = true;
      }
      setPages(loadedPages);
      setRangeInput('1');
      setState('ready');
    } catch (err: any) {
      console.error('Failed to load PDF preview:', err);
      setError('Não foi possível ler o arquivo PDF. Verifique se o arquivo não está danificado ou com senha.');
      setState('idle');
    }
  };

  const handleToggleSelectPage = (pageNum: number) => {
    setPages((prev) => {
      const updated = prev.map((p) =>
        p.pageNumber === pageNum ? { ...p, selected: !p.selected } : p
      );
      const selectedNums = updated.filter((p) => p.selected).map((p) => p.pageNumber);
      setRangeInput(selectedNums.join(', '));
      return updated;
    });
  };

  const handleSelectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
    setRangeInput(`1-${pages.length}`);
  };

  const handleClearAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
    setRangeInput('');
  };

  const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRangeInput(val);
    if (!pages.length) return;
    const parsed = parsePageRangeString(val, pages.length);
    const parsedSet = new Set(parsed);
    setPages((prev) =>
      prev.map((p) => ({ ...p, selected: parsedSet.has(p.pageNumber) }))
    );
  };

  const handleProcessSplit = async () => {
    if (!file) return;

    try {
      setState('processing');
      setError(null);
      setProgress(5);

      const selectedPageNums = pages.filter((p) => p.selected).map((p) => p.pageNumber);

      const res = await splitPdf(
        file,
        {
          mode: splitMode,
          selectedPages: selectedPageNums,
          customRangeString: rangeInput,
        },
        (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        }
      );

      setResult(res);
      setState('completed');
    } catch (err: any) {
      console.error('Split error:', err);
      setError(err?.message || 'Erro ao dividir o documento PDF.');
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
    setRangeInput('1');
  };

  if (state === 'completed' && result) {
    return <ResultDownload result={result} toolTitle="Dividir PDF" onReset={handleReset} />;
  }

  if (state === 'processing') {
    return <ProgressBar progress={progress} message={progressMsg} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">Dividir Arquivo PDF</h2>
        <p className="text-sm text-[#636E72]">
          Extraia páginas específicas, divida por intervalos ou separe todas as páginas em arquivos individuais.
        </p>
      </div>

      {!file ? (
        <Dropzone
          accept={['application/pdf', '.pdf']}
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Arraste o arquivo PDF aqui para dividir"
          subtitle="Selecione 1 arquivo PDF para visualizar e extrair páginas"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info Card */}
          <div className="flex items-center justify-between p-4 bg-white border border-[#E2E6DE] rounded-xl shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-[#F7EDE8] text-[#C86D51] rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2D3436] truncate">{file.name}</p>
                <p className="text-xs text-[#8C9A9E]">
                  {formatBytes(file.size)} • {pages.length} páginas
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

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSplitMode('extract_selected')}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                splitMode === 'extract_selected'
                  ? 'border-[#C86D51] bg-[#FDF6F3] ring-1 ring-[#C86D51]'
                  : 'border-[#E2E6DE] bg-white hover:bg-[#F9FAF8]'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold text-sm text-[#2D3436] mb-1">
                <CheckSquare className="w-4 h-4 text-[#C86D51]" />
                <span>Extrair Páginas</span>
              </div>
              <p className="text-xs text-[#636E72]">
                Cria 1 novo PDF apenas com as páginas que você escolher.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSplitMode('split_all')}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                splitMode === 'split_all'
                  ? 'border-[#C86D51] bg-[#FDF6F3] ring-1 ring-[#C86D51]'
                  : 'border-[#E2E6DE] bg-white hover:bg-[#F9FAF8]'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold text-sm text-[#2D3436] mb-1">
                <Scissors className="w-4 h-4 text-[#C86D51]" />
                <span>Separar Todas as Páginas</span>
              </div>
              <p className="text-xs text-[#636E72]">
                Gera 1 arquivo PDF para cada página, compactados em ZIP.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSplitMode('custom_ranges')}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                splitMode === 'custom_ranges'
                  ? 'border-[#C86D51] bg-[#FDF6F3] ring-1 ring-[#C86D51]'
                  : 'border-[#E2E6DE] bg-white hover:bg-[#F9FAF8]'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold text-sm text-[#2D3436] mb-1">
                <Layers className="w-4 h-4 text-[#C86D51]" />
                <span>Intervalos Customizados</span>
              </div>
              <p className="text-xs text-[#636E72]">
                Divide em vários PDFs agrupados por intervalos (ex: 1-3, 4-8).
              </p>
            </button>
          </div>

          {/* Mode-specific Controls */}
          {splitMode !== 'split_all' && (
            <div className="p-4 bg-white border border-[#E2E6DE] rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-[#2D3436]">
                {splitMode === 'extract_selected'
                  ? 'Páginas a extrair (clique nas miniaturas abaixo ou digite):'
                  : 'Intervalos para dividir (separe por vírgula):'}
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={handleRangeInputChange}
                placeholder={splitMode === 'extract_selected' ? 'Ex: 1, 3, 5-8' : 'Ex: 1-3, 4-6, 7-10'}
                className="w-full px-3.5 py-2 border border-[#CBD2C8] rounded-lg text-sm text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#C86D51] focus:border-[#C86D51]"
              />
              <p className="text-[11px] text-[#8C9A9E]">
                Exemplos aceitos: <code className="bg-[#F0F2ED] px-1 py-0.5 rounded text-[#2D3436]">1-4</code>,{' '}
                <code className="bg-[#F0F2ED] px-1 py-0.5 rounded text-[#2D3436]">1, 3, 5</code>, ou{' '}
                <code className="bg-[#F0F2ED] px-1 py-0.5 rounded text-[#2D3436]">1-2, 5-8</code>
              </p>
            </div>
          )}

          {/* Visual Page Thumbnails Grid */}
          {state === 'loading_preview' ? (
            <div className="text-center py-12 text-[#8C9A9E]">Carregando miniaturas...</div>
          ) : (
            <PageThumbnailGrid
              pages={pages}
              mode={splitMode === 'extract_selected' ? 'select' : 'view'}
              onToggleSelect={handleToggleSelectPage}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
            />
          )}

          {/* Process Button */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-split-action"
              type="button"
              onClick={handleProcessSplit}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#C86D51] hover:bg-[#B3593D] active:bg-[#9B482E] text-white font-semibold py-3 px-8 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Split className="w-5 h-5" />
              <span>
                {splitMode === 'extract_selected'
                  ? `Extrair Páginas Selecionadas`
                  : splitMode === 'split_all'
                  ? `Dividir em ${pages.length} Arquivos (ZIP)`
                  : `Dividir por Intervalos`}
              </span>
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
