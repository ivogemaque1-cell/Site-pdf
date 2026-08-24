import React from 'react';
import PageLayout from './PageLayout';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  return (
    <PageLayout title="Termos de Uso" onBack={onBack}>
      <p className="text-sm text-gray-500">Última atualização: 24 de agosto de 2026</p>

      <p>
        Ao acessar e utilizar o PDF Express (pdf-conversões.com.br), você concorda com os
        termos descritos abaixo.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Uso do serviço</h2>
      <p>
        O PDF Express oferece ferramentas gratuitas para manipulação de arquivos PDF,
        processadas localmente no navegador do usuário. O uso do site é destinado a fins
        pessoais e profissionais lícitos.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">
        Responsabilidades do usuário
      </h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Você é o único responsável pelos arquivos que processa em nossas ferramentas.</li>
        <li>
          É proibido utilizar o site para processar conteúdo ilegal, que viole direitos
          autorais de terceiros, ou que seja ofensivo ou difamatório.
        </li>
        <li>
          O uso do site para fins fraudulentos ou tentativa de comprometer sua segurança é
          estritamente proibido.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Isenção de garantias</h2>
      <p>
        O PDF Express é fornecido "como está", sem garantias de qualquer tipo. Não garantimos
        que o serviço estará livre de erros ou interrupções.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">
        Limitação de responsabilidade
      </h2>
      <p>
        Não nos responsabilizamos por perda de dados ou arquivos corrompidos decorrentes do uso
        das ferramentas. Recomendamos sempre manter uma cópia de backup dos seus arquivos
        originais.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Publicidade</h2>
      <p>
        Este site exibe anúncios fornecidos pelo Google AdSense e outras redes de publicidade
        parceiras, que podem utilizar cookies conforme descrito em nossa Política de
        Privacidade.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Alterações nos termos</h2>
      <p>
        Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. O uso
        continuado do site após alterações implica na aceitação dos novos termos.
      </p>
    </PageLayout>
  );
}
