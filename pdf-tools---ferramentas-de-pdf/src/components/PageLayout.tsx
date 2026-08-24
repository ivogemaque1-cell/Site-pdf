import React from 'react';

interface PageLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export default function PageLayout({ title, onBack, children }: PageLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button
        onClick={onBack}
        className="text-sm text-teal-700 hover:text-teal-900 mb-6 inline-flex items-center gap-1"
      >
        ← Voltar para o início
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
      <div className="prose prose-gray max-w-none text-gray-700 space-y-4 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
