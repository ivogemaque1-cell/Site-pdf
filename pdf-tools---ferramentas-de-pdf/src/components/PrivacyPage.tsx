import React from 'react';
import PageLayout from './PageLayout';

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <PageLayout title="Política de Privacidade" onBack={onBack}>
      <p className="text-sm text-gray-500">Última atualização: 24 de agosto de 2026</p>

      <p>
        Esta Política de Privacidade descreve como o PDF Express (pdf-conversões.com.br)
        trata as informações dos usuários.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Processamento de arquivos</h2>
      <p>
        O PDF Express processa todos os arquivos PDF e imagens inteiramente no navegador do
        usuário, utilizando tecnologias client-side. Isso significa que:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Seus arquivos não são enviados, transmitidos ou armazenados em nenhum servidor.</li>
        <li>Não temos acesso ao conteúdo dos documentos que você processa em nossas ferramentas.</li>
        <li>
          Uma vez que você feche ou atualize a página, os arquivos processados são descartados
          da memória do navegador.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">
        Dados coletados automaticamente
      </h2>
      <p>
        Como a maioria dos sites, podemos coletar automaticamente informações não
        identificáveis sobre o uso do site, como endereço IP, tipo de navegador e dispositivo,
        páginas visitadas e origem do acesso, por meio de ferramentas de análise como o Google
        Analytics.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Cookies e publicidade</h2>
      <p>
        Este site utiliza cookies, incluindo cookies de terceiros, para fins de funcionamento e
        para exibição de anúncios personalizados através do Google AdSense. Você pode desativar
        a personalização de anúncios visitando as{' '}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 underline"
        >
          Configurações de Anúncios do Google
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Compartilhamento de dados</h2>
      <p>
        Não vendemos nem compartilhamos dados pessoais identificáveis com terceiros, exceto
        quando exigido por lei ou para o funcionamento de serviços essenciais.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Seus direitos (LGPD)</h2>
      <p>
        De acordo com a Lei Geral de Proteção de Dados, você tem direito a solicitar
        informações sobre os dados coletados, correção ou exclusão. Para exercer esses
        direitos, entre em contato pela nossa página de Contato.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Alterações nesta política</h2>
      <p>
        Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que você
        revise esta página regularmente.
      </p>
    </PageLayout>
  );
}
