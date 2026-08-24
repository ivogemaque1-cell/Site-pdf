import React, { useState } from 'react';
import { ImageDown, AlertCircle, FileText, Download, FolderArchive, Image as ImageIcon } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { ProgressBar } from '../components/ProgressBar';
import { ResultDownload } from '../components/ResultDownload';
import { pdfToImages } from '../utils/pdfOperations';
import { formatBytes } from '../utils/pdfRender';
import { ProcessedResult, ProcessingState } from '../types';

export const PdfToImagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [resolution, setResolution] = useState<number>(2.0); // scale factor
  const [state, setState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setState('ready');
  };

  const handleProcess = async () => {
    if (!file) return;

    try {
      setState('processing');
      setError(null);
      setProgress(5);

      const res = await pdfToImages(file, format, resolution, (p, msg) => {
        setProgress(p);
        setProgressMsg(msg);
      });

      setResult(res);
      setState('completed');
    } catch (err: any) {
      console.error('PDF to Images error:', err);
      setError(err?.message || 'Erro ao extrair imagens do PDF.');
      setState('ready');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setState('idle');
    setProgress(0);
    setError(null);
  };

  if (state === 'completed' && result) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <ResultDownload
          result={result}
          toolTitle="Converter PDF para Imagens"
          onReset={handleReset}
        />

        {/* Gallery of Extracted Images if multiple */}
        {result.images && result.images.length > 1 && (
          <div className="bg-white border border-[#E2E6DE] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#2D3436] text-sm">
                Todas as Páginas Extraídas ({result.images.length})
              </h3>
              <span className="text-xs text-[#8C9A9E]">Clique para baixar individualmente</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {result.images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative bg-[#F5F7F3] border border-[#E2E6DE] rounded-xl overflow-hidden p-2 flex flex-col items-center shadow-2xs hover:border-[#A35D6A] transition"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="max-h-36 object-contain rounded shadow-2xs mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <div className="w-full flex items-center justify-between text-xs pt-1.5 border-t border-[#E8EBE4]">
                    <span className="text-[#636E72] truncate max-w-[80px] text-[11px] font-medium">
                      Pág. {idx + 1}
                    </span>
                    <a
                      href={img.url}
                      download={img.name}
                      className="inline-flex items-center space-x-1 text-[#A35D6A] hover:text-[#8C4956] font-semibold text-[11px]"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state === 'processing') {
    return <ProgressBar progress={progress} message={progressMsg} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">Converter PDF em Imagens</h2>
        <p className="text-sm text-[#636E72]">
          Transforme cada página do seu documento em arquivos de imagem JPG ou PNG de alta definição.
        </p>
      </div>

      {!file ? (
        <Dropzone
          accept={['application/pdf', '.pdf']}
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Arraste o arquivo PDF aqui"
          subtitle="Extraia todas as páginas como imagens JPG ou PNG"
        />
      ) : (
        <div className="space-y-6">
          {/* File Card */}
          <div className="flex items-center justify-between p-4 bg-white border border-[#E2E6DE] rounded-xl shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-[#FAF0F2] text-[#A35D6A] rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2D3436] truncate">{file.name}</p>
                <p className="text-xs text-[#8C9A9E]">{formatBytes(file.size)}</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-[#636E72] hover:text-[#2D3436] font-medium px-3.5 py-1.5 rounded-lg border border-[#DFE3DA] hover:bg-[#EEF1EB] transition cursor-pointer"
            >
              Trocar arquivo
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format selector */}
            <div className="p-4 bg-white border border-[#E2E6DE] rounded-xl space-y-3">
              <label className="block text-xs font-semibold text-[#2D3436]">Formato da Imagem</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('image/jpeg')}
                  className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                    format === 'image/jpeg'
                      ? 'border-[#A35D6A] bg-[#FAF0F2] text-[#8C4956] font-semibold ring-1 ring-[#A35D6A]'
                      : 'border-[#E2E6DE] hover:bg-[#F9FAF8] text-[#4A5558]'
                  }`}
                >
                  <span className="text-sm">JPG</span>
                  <p className="text-[11px] text-[#8C9A9E] font-normal">Mais leve</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('image/png')}
                  className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                    format === 'image/png'
                      ? 'border-[#A35D6A] bg-[#FAF0F2] text-[#8C4956] font-semibold ring-1 ring-[#A35D6A]'
                      : 'border-[#E2E6DE] hover:bg-[#F9FAF8] text-[#4A5558]'
                  }`}
                >
                  <span className="text-sm">PNG</span>
                  <p className="text-[11px] text-[#8C9A9E] font-normal">Sem perda</p>
                </button>
              </div>
            </div>

            {/* Quality/DPI scale */}
            <div className="p-4 bg-white border border-[#E2E6DE] rounded-xl space-y-3">
              <label className="block text-xs font-semibold text-[#2D3436]">Resolução / DPI</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setResolution(1.5)}
                  className={`p-2.5 rounded-lg border text-center transition cursor-pointer text-xs ${
                    resolution === 1.5
                      ? 'border-[#A35D6A] bg-[#FAF0F2] text-[#8C4956] font-semibold ring-1 ring-[#A35D6A]'
                      : 'border-[#E2E6DE] hover:bg-[#F9FAF8] text-[#4A5558]'
                  }`}
                >
                  150 DPI
                  <p className="text-[10px] text-[#8C9A9E] font-normal">Normal</p>
                </button>
                <button
                  type="button"
                  onClick={() => setResolution(2.0)}
                  className={`p-2.5 rounded-lg border text-center transition cursor-pointer text-xs ${
                    resolution === 2.0
                      ? 'border-[#A35D6A] bg-[#FAF0F2] text-[#8C4956] font-semibold ring-1 ring-[#A35D6A]'
                      : 'border-[#E2E6DE] hover:bg-[#F9FAF8] text-[#4A5558]'
                  }`}
                >
                  300 DPI
                  <p className="text-[10px] text-[#8C9A9E] font-normal">Alta</p>
                </button>
                <button
                  type="button"
                  onClick={() => setResolution(3.0)}
                  className={`p-2.5 rounded-lg border text-center transition cursor-pointer text-xs ${
                    resolution === 3.0
                      ? 'border-[#A35D6A] bg-[#FAF0F2] text-[#8C4956] font-semibold ring-1 ring-[#A35D6A]'
                      : 'border-[#E2E6DE] hover:bg-[#F9FAF8] text-[#4A5558]'
                  }`}
                >
                  450 DPI
                  <p className="text-[10px] text-[#8C9A9E] font-normal">Ultra</p>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-pdf-to-img-action"
              type="button"
              onClick={handleProcess}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#A35D6A] hover:bg-[#8C4956] active:bg-[#773845] text-white font-semibold py-3 px-8 rounded-xl shadow-xs transition cursor-pointer"
            >
              <ImageDown className="w-5 h-5" />
              <span>Converter para Imagens</span>
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
