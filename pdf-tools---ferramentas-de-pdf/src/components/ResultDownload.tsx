import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Download, CheckCircle, RotateCcw, ExternalLink, ArrowDownRight, FileText, FolderArchive } from 'lucide-react';
import { ProcessedResult } from '../types';
import { formatBytes } from '../utils/pdfRender';

interface ResultDownloadProps {
  result: ProcessedResult;
  toolTitle: string;
  onReset: () => void;
}

export const ResultDownload: React.FC<ResultDownloadProps> = ({ result, toolTitle, onReset }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#0284C7'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (result.url) {
      window.open(result.url, '_blank');
    }
  };

  const reductionPercentage =
    result.originalSize && result.originalSize > 0 && result.originalSize > result.fileSize
      ? Math.round(((result.originalSize - result.fileSize) / result.originalSize) * 100)
      : null;

  return (
    <div className="bg-white border border-[#E2E6DE] rounded-2xl p-6 sm:p-10 shadow-xs max-w-xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 bg-[#EAF1EC] text-[#2D5A43] rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-9 h-9 stroke-[2.5]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-[#2D3436]">Seu arquivo está pronto!</h3>
        <p className="text-sm text-[#636E72]">
          Operação <strong className="text-[#2D3436]">{toolTitle}</strong> concluída com sucesso.
        </p>
      </div>

      {/* File summary badge */}
      <div className="bg-[#F4F6F1] border border-[#E2E6DE] rounded-xl p-4 text-left space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#2D5A43] text-white rounded-lg">
            {result.type === 'zip' ? <FolderArchive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#2D3436] truncate">{result.fileName}</p>
            <p className="text-xs text-[#636E72]">{formatBytes(result.fileSize)}</p>
          </div>
        </div>

        {/* Compression stats if available */}
        {reductionPercentage !== null && result.originalSize && (
          <div className="pt-2 border-t border-[#E2E6DE] flex items-center justify-between text-xs">
            <div className="text-[#636E72]">
              De <span className="line-through">{formatBytes(result.originalSize)}</span> para{' '}
              <strong className="text-[#2D5A43]">{formatBytes(result.fileSize)}</strong>
            </div>
            <div className="flex items-center space-x-1 bg-[#EAF1EC] text-[#244E39] border border-[#D0DFD5] font-bold px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-{reductionPercentage}% de economia</span>
            </div>
          </div>
        )}
      </div>

      {/* Download Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          id="btn-download-result"
          onClick={handleDownload}
          className="w-full inline-flex items-center justify-center space-x-2 bg-[#2D5A43] hover:bg-[#224533] active:bg-[#1E3E2E] text-white py-3.5 px-6 rounded-xl font-semibold text-base shadow-xs hover:shadow transition cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Baixar {result.type === 'zip' ? 'Arquivo ZIP' : 'Arquivo PDF'}</span>
        </button>

        {result.type === 'pdf' && (
          <button
            id="btn-preview-result"
            onClick={handlePreview}
            className="w-full inline-flex items-center justify-center space-x-2 bg-[#EEF1EB] hover:bg-[#E2E6DE] text-[#2D3436] py-2.5 px-4 rounded-xl font-medium text-sm border border-[#DFE3DA] transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visualizar em Nova Aba</span>
          </button>
        )}

        <button
          id="btn-process-another"
          onClick={onReset}
          className="inline-flex items-center space-x-1.5 text-xs text-[#636E72] hover:text-[#2D3436] font-medium py-2 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Processar outro arquivo</span>
        </button>
      </div>
    </div>
  );
};
