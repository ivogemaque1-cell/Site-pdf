import React from 'react';
import { PageLayout } from './PageLayout';

interface ContactPageProps {
  onBack: () => void;
}

export function ContactPage({ onBack }: ContactPageProps) {
  return (
    <PageLayout title="Fale conosco" onBack={onBack}>
      <p>
        Tem dúvidas, sugestões ou encontrou algum problema em uma das ferramentas? Ficaremos
        felizes em ajudar.
      </p>

      <div className="bg-[#EEF1EB] border border-[#E1E5DC] rounded-lg p-6 my-6">
        <p className="mb-1">
          <strong>E-mail:</strong>{' '}
          <a
            href="mailto:ivogemaque1@gmail.com"
            className="text-[#2D5A43] underline"
          >
            contato@ivogemaque1@gmail.com
          </a>
        </p>
        <p className="text-sm text-[#7F8C8D]">Tempo médio de resposta: até 2 dias úteis</p>
      </div>

      <p>
        Se sua mensagem for sobre uma ferramenta específica, inclua o máximo de detalhes
        possível (navegador utilizado, tipo de arquivo, mensagem de erro) para que possamos
        ajudar mais rápido.
      </p>
    </PageLayout>
  );
}
