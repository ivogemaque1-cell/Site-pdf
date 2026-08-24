import React from 'react';

interface PageLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function PageLayout({ title, onBack, children }: PageLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-[#2D5A43] hover:text-[#1F3D2E] mb-6 inline-flex items-center gap-1 font-medium"
      >
        ← Voltar para o início
      </button>
      <h1 className="text-3xl font-bold text-[#2D3436] mb-8">{title}</h1>
      <div className="space-y-4 leading-relaxed text-[#4A5558]">{children}</div>
    </div>
  );
}
