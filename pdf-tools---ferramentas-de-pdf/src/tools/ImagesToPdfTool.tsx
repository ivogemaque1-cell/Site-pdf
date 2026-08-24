import React, { useState } from 'react';
import { FileImage, ArrowUp, ArrowDown, Trash2, Plus, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { ProgressBar } from '../components/ProgressBar';
import { ResultDownload } from '../components/ResultDownload';
import { imagesToPdf } from '../utils/pdfOperations';
import { formatBytes } from '../utils/pdfRender';
import { ProcessedResult, ProcessingState } from '../types';

interface ImageItem {
  file: File;
  previewUrl: string;
}

export const ImagesToPdfTool: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(10);
  const [state, setState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    const items: ImageItem[] = newFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...items]);
    setError(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleProcess = async () => {
    if (images.length === 0) {
      setError('Por favor, adicione pelo menos 1 imagem.');
      return;
    }

    try {
      setState('processing');
      setError(null);
      setProgress(5);

      const files = images.map((i) => i.file);
      const res = await imagesToPdf(
        files,
        {
          pageSize,
          orientation,
          margin,
        },
        (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        }
      );

      setResult(res);
      setState('completed');
    } catch (err: any) {
      console.error('Images to PDF error:', err);
      setError(err?.message || 'Erro ao converter imagens para PDF.');
      setState('idle');
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResult(null);
    setState('idle');
    setProgress(0);
    setError(null);
  };

  if (state === 'completed' && result) {
    return <ResultDownload result={result} toolTitle="Converter Imagens para PDF" onReset={handleReset} />;
  }

  if (state === 'processing') {
    return <ProgressBar progress={progress} message={progressMsg} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">Converter Imagens para PDF</h2>
        <p className="text-sm text-[#636E72]">
          Transforme fotos JPG, PNG e WebP em um documento PDF organizado e ajustável.
        </p>
      </div>

      {images.length === 0 ? (
        <Dropzone
          accept={['image/jpeg', 'image/png', 'image/webp', '.jpg', '.jpeg', '.png', '.webp']}
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Arraste suas imagens aqui"
          subtitle="Converta JPG, PNG ou WebP em um único arquivo PDF"
        />
      ) : (
        <div className="space-y-6">
          {/* Header count and add more */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#2D3436]">
              {images.length} {images.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
            </span>

            <label className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#2C5252] bg-[#EAF2F2] hover:bg-[#D8E8E8] border border-[#C5DCDD] px-3.5 py-1.5 rounded-lg cursor-pointer transition">
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Mais Imagens</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                }}
              />
            </label>
          </div>

          {/* Configuration panel */}
          <div className="p-4 bg-white border border-[#E2E6DE] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Page Size */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#2D3436]">Tamanho da Página</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#CBD2C8] rounded-lg bg-white text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#3A6B6B]"
              >
                <option value="a4">A4 (Padrão)</option>
                <option value="fit">Ajustar ao tamanho da imagem</option>
                <option value="letter">Carta (Letter)</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#2D3436]">Orientação</label>
              <select
                value={orientation}
                disabled={pageSize === 'fit'}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#CBD2C8] rounded-lg bg-white disabled:bg-[#F0F2ED] text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#3A6B6B]"
              >
                <option value="auto">Automática (Detectar imagem)</option>
                <option value="portrait">Retrato (Vertical)</option>
                <option value="landscape">Paisagem (Horizontal)</option>
              </select>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#2D3436]">Margem</label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#CBD2C8] rounded-lg bg-white text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#3A6B6B]"
              >
                <option value={0}>Sem margem</option>
                <option value={10}>Pequena (10px)</option>
                <option value={24}>Média (24px)</option>
              </select>
            </div>
          </div>

          {/* Images Grid / List with Reordering */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((item, idx) => (
              <div
                key={`${item.file.name}-${idx}`}
                className="relative bg-white border border-[#E2E6DE] rounded-xl overflow-hidden shadow-2xs hover:border-[#CBD2C8] transition flex flex-col"
              >
                {/* Header with index */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F7F8F6] border-b border-[#E8EBE4] text-[11px]">
                  <span className="font-semibold text-[#2D3436]">Pág. {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-[#C86D51] hover:text-[#9A2C2C] p-0.5 rounded cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview Image */}
                <div className="aspect-[3/4] p-2 bg-[#F5F7F3] flex items-center justify-center">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="max-w-full max-h-full object-contain rounded shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Reorder Buttons */}
                <div className="p-1 bg-[#F7F8F6] border-t border-[#E8EBE4] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1 text-[#636E72] hover:text-[#2D3436] disabled:opacity-25 rounded cursor-pointer"
                    title="Mover para esquerda/anterior"
                  >
                    <ArrowUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                  </button>
                  <span className="text-[10px] text-[#8C9A9E] truncate max-w-[80px]">
                    {formatBytes(item.file.size)}
                  </span>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1 text-[#636E72] hover:text-[#2D3436] disabled:opacity-25 rounded cursor-pointer"
                    title="Mover para direita/próximo"
                  >
                    <ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#636E72] hover:text-[#2D3436] cursor-pointer"
            >
              Limpar todas as imagens
            </button>

            <button
              id="btn-img-to-pdf-action"
              type="button"
              onClick={handleProcess}
              className="inline-flex items-center justify-center space-x-2 bg-[#3A6B6B] hover:bg-[#2F5858] active:bg-[#244646] text-white font-semibold py-3 px-8 rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileImage className="w-5 h-5" />
              <span>Gerar PDF ({images.length} imagens)</span>
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
