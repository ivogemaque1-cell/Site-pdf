import React from 'react';
import {
  Combine,
  Split,
  Minimize2,
  ImageDown,
  FileImage,
  Trash2,
  RotateCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ToolInfo } from '../types';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Combine,
  Split,
  Minimize2,
  ImageDown,
  FileImage,
  Trash2,
  RotateCw,
};

interface ToolCardProps {
  tool: ToolInfo;
  onSelect: (tool: ToolInfo) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const IconComponent = iconMap[tool.iconName] || Combine;

  return (
    <div
      id={`tool-card-${tool.id}`}
      onClick={() => onSelect(tool)}
      className="group relative bg-white border border-[#E2E6DE] hover:border-[#2D5A43]/70 rounded-2xl p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Icon & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
            <IconComponent className="w-6 h-6 stroke-[2]" />
          </div>

          {tool.badge && (
            <span className="text-[11px] font-semibold bg-[#EAF1EC] text-[#244E39] border border-[#D0DFD5] px-2.5 py-0.5 rounded-full">
              {tool.badge}
            </span>
          )}
        </div>

        {/* Title and description */}
        <h3 className="text-base font-bold text-[#2D3436] group-hover:text-[#2D5A43] transition-colors mb-1.5">
          {tool.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#636E72] leading-relaxed">
          {tool.shortDesc}
        </p>
      </div>

      {/* Bottom link call-to-action */}
      <div className="mt-5 pt-3 border-t border-[#F0F2ED] flex items-center justify-between text-xs font-semibold text-[#636E72] group-hover:text-[#2D5A43] transition-colors">
        <span>Usar ferramenta</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
