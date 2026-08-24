import React from 'react';
import { ShieldCheck, Zap, Lock, HardDrive } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#2B3A33] via-[#24332D] to-[#1F2C26] text-[#F7F8F6] rounded-2xl p-6 sm:p-8 my-8 shadow-sm relative overflow-hidden border border-[#3E4F46]">
      <div className="absolute right-0 top-0 w-96 h-96 bg-[#4A7C59]/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-[#A3D9C0] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#F7F8F6] mb-1">Privacidade Absoluta</h4>
            <p className="text-xs text-[#CBD8D0] leading-relaxed">
              O processamento ocorre diretamente no seu navegador. Nenhum arquivo é transferido para servidores externos.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-[#A3D9C0] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#F7F8F6] mb-1">Velocidade Instantânea</h4>
            <p className="text-xs text-[#CBD8D0] leading-relaxed">
              Sem filas de espera ou tempo de upload e download de servidor. O poder do seu computador faz o trabalho na hora.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-[#A3D9C0] shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#F7F8F6] mb-1">Sem Limites Artificiais</h4>
            <p className="text-xs text-[#CBD8D0] leading-relaxed">
              Uso gratuito e ilimitado para documentos pessoais, acadêmicos ou corporativos confidenciais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
