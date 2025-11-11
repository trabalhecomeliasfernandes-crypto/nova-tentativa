import React, { useMemo } from 'react';
import { Salesperson } from '../types';

interface TickerProps {
    salespeople: Salesperson[];
}

const Ticker: React.FC<TickerProps> = ({ salespeople }) => {
    
    const announcements = useMemo(() => {
        const messages = [];
        if (!salespeople) return [];

        salespeople.forEach(sp => {
            const totalPago = sp.data.reduce((acc, curr) => acc + curr.pago, 0);
            const totalContratos = sp.data.reduce((acc, curr) => acc + curr.contratosFechados, 0);

            if (totalPago > 8000) {
                messages.push(`🎉 Parabéns, ${sp.name}, por alcançar R$ ${totalPago.toLocaleString('pt-BR')} em pagamentos!`);
            }
            if (totalContratos > 40) {
                messages.push(`🚀 Incrível! ${sp.name} já fechou ${totalContratos} contratos!`);
            }
        });
        
        if (messages.length === 0) {
            messages.push("Bem-vindo ao painel de performance Rescore. Acompanhe os resultados em tempo real.")
        }
        
        // Ensure there's enough content for a smooth loop
        const repeatedMessages = messages.length > 0 ? Array(Math.ceil(10 / messages.length)).fill(messages).flat() : [];

        return repeatedMessages;

    }, [salespeople]);

    if (announcements.length === 0) return null;

    return (
        <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 overflow-hidden whitespace-nowrap">
            <div className="flex ticker-track">
                {/* Render the list twice for a seamless loop */}
                {announcements.map((text, index) => (
                    <div key={`item1-${index}`} className="py-2 px-8 text-sm text-gray-300">
                        {text}
                    </div>
                ))}
                 {announcements.map((text, index) => (
                    <div key={`item2-${index}`} className="py-2 px-8 text-sm text-gray-300">
                        {text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Ticker;