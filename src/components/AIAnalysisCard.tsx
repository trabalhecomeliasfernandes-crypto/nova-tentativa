import React, { useState, useCallback } from 'react';
import { Salesperson, CalculatedMetrics } from '../types';
import { getPerformanceSummary } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface AIAnalysisCardProps {
    salesperson: Salesperson;
    metrics: CalculatedMetrics;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ salesperson, metrics }) => {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSummary('');
        try {
            const result = await getPerformanceSummary(salesperson, metrics);
            setSummary(result);
        } catch (e) {
            setError('Falha ao gerar o resumo. Tente novamente.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [salesperson, metrics]);

    return (
        <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700/50 mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Análise de Performance por IA</h3>
            <p className="text-gray-400 mb-4">
                Receba um resumo do desempenho de <span className="font-bold text-blue-400">{salesperson.name}</span>, com pontos fortes e sugestões de melhoria, gerado por IA.
            </p>
            
            <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mb-4"
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Analisando...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="h-5 w-5" />
                        Gerar Análise
                    </>
                )}
            </button>

            {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-lg">{error}</div>}
            
            {summary && (
                 <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="prose prose-invert max-w-none" style={{ whiteSpace: 'pre-wrap' }}>
                        {summary}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAnalysisCard;