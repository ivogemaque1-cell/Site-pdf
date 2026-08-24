import React from 'react';
import PageLayout from './PageLayout';

interface ContactPageProps {
  onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  return (
    <PageLayout title="Fale conosco" onBack={onBack}>
      <p>
        Tem dúvidas, sugestões ou encontrou algum problema em uma das ferramentas? Ficaremos
        felizes em ajudar.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-6">
        <p className="mb-1">
          <strong>E-mail:</strong>{' '}
          <a href="mailto:contato@pdf-conversões.com.br" className="text-teal-700 underline">
            contato@pdf-conversões.com.br
          </a>
        </p>
        <p className="text-sm text-gray-500">Tempo médio de resposta: até 2 dias úteis</p>
      </div>

      <p>
        Se sua mensagem for sobre uma ferramenta específica, inclua o máximo de detalhes
        possível (navegador utilizado, tipo de arquivo, mensagem de erro) para que possamos
        ajudar mais rápido.
      </p>
    </PageLayout>
  );
}
