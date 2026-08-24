import React, { useState } from 'react';
import { Search, Shield, Zap, Lock, Sparkles } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { PrivacyBanner } from './PrivacyBanner';
import { TOOLS } from '../data/toolsData';
import { ToolInfo } from '../types';

interface ToolCatalogProps {
  onSelectTool: (tool: ToolInfo) => void;
}

export const ToolCatalog: React.FC<ToolCatalogProps> = ({ onSelectTool }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fullDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4 sm:pt-6">
        <div className="inline-flex items-center space-x-2 bg-[#EAF1EC] text-[#244E39] text-xs font-semibold px-3.5 py-1 rounded-full border border-[#D0DFD5] shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-[#2D5A43]" />
          <span>Privacidade Máxima • 100% no seu Navegador</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D3436] tracking-tight">
          Todas as ferramentas de PDF que você precisa, simplificadas.
        </h1>

        <p className="text-sm sm:text-base text-[#636E72]">
          Junte, divida, comprima, converta, remova e rotacione páginas de PDF gratuitamente. Seus arquivos nunca saem da sua máquina.
        </p>

        {/* Search filter input */}
        <div className="pt-3 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C9A9E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-tools-input"
              type="text"
              placeholder="Buscar ferramenta (ex: juntar, dividir, comprimir)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E6DE] rounded-xl text-sm text-[#2D3436] placeholder:text-[#8C9A9E] focus:outline-none focus:ring-2 focus:ring-[#2D5A43] focus:border-[#2D5A43] shadow-2xs transition"
            />
          </div>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E6DE] p-8">
          <p className="text-[#636E72] font-medium">Nenhuma ferramenta encontrada para "{searchTerm}".</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-3 text-xs text-[#2D5A43] hover:text-[#1A3828] font-semibold cursor-pointer underline"
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* Privacy Guarantee Banner */}
      <PrivacyBanner />
    </div>
  );
};
