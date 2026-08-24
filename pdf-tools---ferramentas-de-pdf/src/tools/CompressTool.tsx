import React, { useState } from 'react';
import { Minimize2, AlertCircle, FileText, CheckCircle2, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { ProgressBar } from '../components/ProgressBar';
import { ResultDownload } from '../components/ResultDownload';
import { compressPdf } from '../utils/pdfOperations';
import { formatBytes } from '../utils/pdfRender';
import { ProcessedResult, ProcessingState } from '../types';

export const CompressTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high'>('medium');
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

  const handleProcessCompress = async () => {
    if (!file) return;

    try {
      setState('processing');
      setError(null);
      setProgress(5);

      const res = await compressPdf(file, qualityLevel, (p, msg) => {
        setProgress(p);
        setProgressMsg(msg);
      });

      setResult(res);
      setState('completed');
    } catch (err: any) {
      console.error('Compress error:', err);
      setError(err?.message || 'Erro ao comprimir o arquivo PDF.');
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
    return <ResultDownload result={result} toolTitle="Comprimir PDF" onReset={handleReset} />;
  }

  if (state === 'processing') {
    return <ProgressBar progress={progress} message={progressMsg} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">Comprimir Arquivo PDF</h2>
        <p className="text-sm text-[#636E72]">
          Reduza o tamanho do seu PDF diretamente no navegador mantendo alta legibilidade.
        </p>
      </div>

      {!file ? (
        <Dropzone
          accept={['application/pdf', '.pdf']}
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Arraste seu PDF aqui para comprimir"
          subtitle="Otimize o tamanho para envio por e-mail ou portais do governo"
        />
      ) : (
        <div className="space-y-6">
          {/* File Card */}
          <div className="flex items-center justify-between p-4 bg-white border border-[#E2E6DE] rounded-xl shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-[#FDF5E8] text-[#D48B38] rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2D3436] truncate">{file.name}</p>
                <p className="text-xs text-[#8C9A9E]">Tamanho atual: {formatBytes(file.size)}</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-[#636E72] hover:text-[#2D3436] font-medium px-3.5 py-1.5 rounded-lg border border-[#DFE3DA] hover:bg-[#EEF1EB] transition cursor-pointer"
            >
              Trocar arquivo
            </button>
          </div>

          {/* Compression Level Options */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#2D3436] uppercase tracking-wider">
              Escolha o nível de compressão
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Extreme Compression */}
              <button
                type="button"
                onClick={() => setQualityLevel('low')}
                className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
                  qualityLevel === 'low'
                    ? 'border-[#D48B38] bg-[#FDF9F2] ring-1 ring-[#D48B38]'
                    : 'border-[#E2E6DE] bg-white hover:bg-[#F9FAF8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#2D3436]">Extrema</span>
                  <Zap className="w-4 h-4 text-[#D48B38]" />
                </div>
                <p className="text-xs text-[#636E72] mb-2">Menor tamanho possível. Ideal para limites rigorosos.</p>
                <span className="text-[11px] font-medium text-[#9E621C] bg-[#FDF0DE] border border-[#F4DCB8] px-2 py-0.5 rounded">
                  Alta economia
                </span>
              </button>

              {/* Recommended Compression */}
              <button
                type="button"
                onClick={() => setQualityLevel('medium')}
                className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
                  qualityLevel === 'medium'
                    ? 'border-[#D48B38] bg-[#FDF9F2] ring-1 ring-[#D48B38] shadow-xs'
                    : 'border-[#E2E6DE] bg-white hover:bg-[#F9FAF8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#2D3436]">Recomendada</span>
                  <Sparkles className="w-4 h-4 text-[#D48B38]" />
                </div>
                <p className="text-xs text-[#636E72] mb-2">Equilíbrio perfeito entre qualidade e tamanho.</p>
                <span className="text-[11px] font-medium text-[#244E39] bg-[#EAF1EC] border border-[#D0DFD5] px-2 py-0.5 rounded">
                  Recomendado
                </span>
              </button>

              {/* Light Compression */}
              <button
                type="button"
                onClick={() => setQualityLevel('high')}
                className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
                  qualityLevel === 'high'
                    ? 'border-[#D48B38] bg-[#FDF9F2] ring-1 ring-[#D48B38]'
                    : 'border-[#E2E6DE] bg-white hover:bg-[#F9FAF8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#2D3436]">Leve</span>
                  <CheckCircle2 className="w-4 h-4 text-[#636E72]" />
                </div>
                <p className="text-xs text-[#636E72] mb-2">Alta fidelidade com compressão moderada.</p>
                <span className="text-[11px] font-medium text-[#4A5558] bg-[#EEF1EB] border border-[#DFE3DA] px-2 py-0.5 rounded">
                  Máxima nitidez
                </span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-compress-action"
              type="button"
              onClick={handleProcessCompress}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#D48B38] hover:bg-[#BC772A] active:bg-[#A3641E] text-white font-semibold py-3 px-8 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Minimize2 className="w-5 h-5" />
              <span>Comprimir PDF</span>
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
