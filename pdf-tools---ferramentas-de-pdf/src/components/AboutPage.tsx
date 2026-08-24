import React from 'react';
import PageLayout from './PageLayout';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <PageLayout title="Sobre nós" onBack={onBack}>
      <p>
        O PDF Express nasceu de uma necessidade simples: encontrar uma forma rápida e
        confiável de editar arquivos PDF sem precisar instalar programas pesados ou confiar
        documentos sensíveis a servidores desconhecidos.
      </p>
      <p>
        Construímos cada ferramenta pensando em duas coisas: <strong>simplicidade</strong> e{' '}
        <strong>privacidade</strong>. Por isso, todo o processamento dos seus arquivos
        acontece localmente, no seu próprio navegador — nunca em nossos servidores. Isso
        significa que documentos pessoais, contratos ou informações confidenciais nunca saem
        do seu computador.
      </p>
      <p>
        Nosso objetivo é manter o PDF Express gratuito, acessível e útil para qualquer pessoa
        que precise resolver tarefas comuns com arquivos PDF no dia a dia, seja para uso
        pessoal, acadêmico ou profissional.
      </p>
      <p>
        Se tiver sugestões de novas ferramentas ou encontrar algum problema, entre em contato
        pela nossa página de{' '}
        <a href="#" className="text-teal-700 underline">
          Contato
        </a>
        .
      </p>
    </PageLayout>
  );
}
