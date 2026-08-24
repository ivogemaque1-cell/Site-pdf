import React from 'react';

type Page = 'home' | 'about' | 'privacy' | 'terms' | 'contact';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-teal-700" />
            <span className="font-semibold text-gray-900">PDF Express</span>
          </div>
          <p className="text-sm text-gray-500">
            Ferramentas de PDF rápidas e privadas. Tudo processado no seu navegador.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Empresa</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="text-gray-500 hover:text-teal-700 transition-colors"
              >
                Sobre nós
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('contact')}
                className="text-gray-500 hover:text-teal-700 transition-colors"
              >
                Contato
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => onNavigate('privacy')}
                className="text-gray-500 hover:text-teal-700 transition-colors"
              >
                Política de Privacidade
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('terms')}
                className="text-gray-500 hover:text-teal-700 transition-colors"
              >
                Termos de Uso
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {year} PDF Express. Todos os direitos reservados.
      </div>
    </footer>
  );
}
