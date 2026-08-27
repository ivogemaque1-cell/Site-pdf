/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ToolCatalog } from './components/ToolCatalog';
import { MergeTool } from './tools/MergeTool';
import { SplitTool } from './tools/SplitTool';
import { CompressTool } from './tools/CompressTool';
import { PdfToImagesTool } from './tools/PdfToImagesTool';
import { ImagesToPdfTool } from './tools/ImagesToPdfTool';
import { RemovePagesTool } from './tools/RemovePagesTool';
import { RotatePagesTool } from './tools/RotatePagesTool';
import { ToolInfo } from './types';
import { ShieldCheck, Heart, FileText } from 'lucide-react';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';

type LegalPage = 'about' | 'privacy' | 'terms' | 'contact' | null;

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolInfo | null>(null);
  const [legalPage, setLegalPage] = useState<LegalPage>(null);

  const handleSelectTool = (tool: ToolInfo) => {
    setActiveTool(tool);
    setLegalPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackToHome = () => {
    setActiveTool(null);
    setLegalPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleNavigateLegal = (page: LegalPage) => {
    setActiveTool(null);
    setLegalPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const renderToolView = () => {
    if (!activeTool) return null;
    switch (activeTool.id) {
      case 'merge':
        return <MergeTool />;
      case 'split':
        return <SplitTool />;
      case 'compress':
        return <CompressTool />;
      case 'pdf-to-img':
        return <PdfToImagesTool />;
      case 'img-to-pdf':
        return <ImagesToPdfTool />;
      case 'remove-pages':
        return <RemovePagesTool />;
      case 'rotate':
        return <RotatePagesTool />;
      default:
        return <div className="text-center py-12 text-slate-500">Ferramenta em desenvolvimento.</div>;
    }
  };
  const renderLegalView = () => {
    switch (legalPage) {
      case 'about':
        return <AboutPage onBack={handleBackToHome} />;
      case 'privacy':
        return <PrivacyPage onBack={handleBackToHome} />;
      case 'terms':
        return <TermsPage onBack={handleBackToHome} />;
      case 'contact':
        return <ContactPage onBack={handleBackToHome} />;
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col font-sans text-[#2D3436] selection:bg-[#DCE7E1] selection:text-[#1F3D2E]">
      {/* Top Navigation */}
      <Navbar currentTool={activeTool} onBackToHome={handleBackToHome} />
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {legalPage ? (
          renderLegalView()
        ) : !activeTool ? (
          <ToolCatalog onSelectTool={handleSelectTool} />
        ) : (
          <div className="space-y-6">
            {/* Tool Active Canvas */}
            {renderToolView()}
          </div>
        )}
      </main>
      {/* Footer */}
      <footer className="bg-[#EEF1EB] border-t border-[#E1E5DC] mt-auto py-8 text-center text-xs text-[#636E72]">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[#4A5558] font-medium">
            <span className="flex items-center space-x-1.5 text-[#2D5A43]">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacidade Garantida: Processamento 100% Client-Side</span>
            </span>
            <span className="text-[#BDC3C7]">•</span>
            <span>Sem registro de dados</span>
            <span className="text-[#BDC3C7]">•</span>
            <span>Sem limites diários</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[#4A5558]">
            <button onClick={() => handleNavigateLegal('about')} className="hover:text-[#2D5A43] transition-colors">
              Sobre nós
            </button>
            <span className="text-[#BDC3C7]">•</span>
            <button onClick={() => handleNavigateLegal('privacy')} className="hover:text-[#2D5A43] transition-colors">
              Política de Privacidade
            </button>
            <span className="text-[#BDC3C7]">•</span>
            <button onClick={() => handleNavigateLegal('terms')} className="hover:text-[#2D5A43] transition-colors">
              Termos de Uso
            </button>
            <span className="text-[#BDC3C7]">•</span>
            <button onClick={() => handleNavigateLegal('contact')} className="hover:text-[#2D5A43] transition-colors">
              Contato
            </button>
          </div>

          <p className="text-[#7F8C8D]">
            PDF Conversões — Todas as manipulações de arquivos são executadas exclusivamente na memória do seu navegador.
          </p>
        </div>
      </footer>
    </div>
  );
}
