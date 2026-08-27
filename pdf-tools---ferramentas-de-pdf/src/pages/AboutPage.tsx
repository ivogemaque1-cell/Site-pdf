import React from 'react';
import { PageLayout } from './PageLayout';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <PageLayout title="Sobre nós" onBack={onBack}>
      <p>
        O PDF Conversões de uma necessidade simples: encontrar uma forma rápida e
        confiável de editar arquivos PDF sem precisar instalar programas pesados ou confiar
        documentos sensíveis a servidores desconhecidos.
      </p>
      <p>
        Construímos cada ferramenta pensando em duas coisas:{' '}
        <strong className="text-[#2D5A43]">simplicidade</strong> e{' '}
        <strong className="text-[#2D5A43]">privacidade</strong>. Por isso, todo o
        processamento dos seus arquivos acontece localmente, no seu próprio navegador — nunca
        em nossos servidores. Isso significa que documentos pessoais, contratos ou informações
        confidenciais nunca saem do seu computador.
      </p>
      <p>
        Nosso objetivo é manter oPDF Conversões gratuito, acessível e útil para qualquer pessoa
        que precise resolver tarefas comuns com arquivos PDF no dia a dia, seja para uso
        pessoal, acadêmico ou profissional.
      </p>
      <p>
        Se tiver sugestões de novas ferramentas ou encontrar algum problema, entre em contato
        pela nossa página de Contato.
      </p>
    </PageLayout>
  );
}
