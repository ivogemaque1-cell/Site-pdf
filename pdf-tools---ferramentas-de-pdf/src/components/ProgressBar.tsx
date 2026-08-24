import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  message?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="bg-white border border-[#E2E6DE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 max-w-lg mx-auto text-center">
      <div className="flex items-center justify-center space-x-3 text-[#2D5A43]">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-semibold text-[#2D3436] text-base">Processando localmente...</span>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-[#EAECE6] rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#2D5A43] to-[#4A7C59] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-[#636E72] font-medium">
          <span>{message || 'Executando operações...'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <p className="text-[11px] text-[#8C9A9E]">
        Seus arquivos estão sendo processados na memória do seu navegador.
      </p>
    </div>
  );
};
