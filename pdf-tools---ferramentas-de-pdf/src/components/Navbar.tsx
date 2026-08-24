import React from 'react';
import { ShieldCheck, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { ToolInfo } from '../types';

interface NavbarProps {
  currentTool: ToolInfo | null;
  onBackToHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTool, onBackToHome }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFDFD]/90 backdrop-blur-md border-b border-[#E2E6DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & back button */}
          <div className="flex items-center space-x-3">
            {currentTool ? (
              <button
                id="btn-back-home"
                onClick={onBackToHome}
                className="flex items-center space-x-2 text-[#2D3436] hover:text-[#1A2022] bg-[#EEF1EB] hover:bg-[#E2E6DE] border border-[#DFE3DA] px-3.5 py-1.5 rounded-xl text-sm font-medium transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Todas as Ferramentas</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onBackToHome}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2D5A43] to-[#43755C] flex items-center justify-center text-[#F7F8F6] shadow-sm shadow-[#2D5A43]/15">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-lg text-[#2D3436] tracking-tight">PDF Express</span>
                    <span className="bg-[#EAF1EC] text-[#244E39] border border-[#D0DFD5] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      100% Local
                    </span>
                  </div>
                  <p className="text-[11px] text-[#636E72] hidden sm:block">Ferramentas de PDF rápidas e sem upload</p>
                </div>
              </div>
            )}

            {currentTool && (
              <div className="hidden sm:flex items-center space-x-2 border-l border-[#E2E6DE] pl-3">
                <span className="text-sm font-semibold text-[#2D3436]">{currentTool.title}</span>
              </div>
            )}
          </div>

          {/* Privacy Trust Badge */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-[#EAF1EC] border border-[#D0DFD5] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#244E39] shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#2D5A43] stroke-[2.5]" />
              <span className="hidden sm:inline">100% Seguro: Seus arquivos nunca saem do seu dispositivo</span>
              <span className="sm:hidden">100% Seguro & Local</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
