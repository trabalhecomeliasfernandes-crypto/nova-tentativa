import React, { useState, useMemo } from 'react';
import { Salesperson, DailyRecord, CalculatedMetrics, TimePeriod } from '../types';
import StatCard from './StatCard';
import PerformanceChart from './PerformanceChart';
import AIAnalysisCard from './AIAnalysisCard';
import { UsersIcon, CurrencyDollarIcon, CheckCircleIcon, ChartBarIcon } from './Icons';

// --- UTILITY FUNCTIONS ---

// Filters data based on the selected time period
const filterDataByPeriod = (data: DailyRecord[], period: TimePeriod): DailyRecord[] => {
    const sortedData = [...data].sort((a, b) => b.dia - a.dia);
    if (sortedData.length === 0) return [];

    const lastDayWithData = sortedData[0].dia;

    switch (period) {
        case TimePeriod.Day:
            return sortedData.filter(d => d.dia === lastDayWithData);
        case TimePeriod.Week:
            const weekStartDay = Math.max(1, lastDayWithData - 6);
            return sortedData.filter(d => d.dia >= weekStartDay && d.dia <= lastDayWithData);
        case TimePeriod.Month:
        default:
            return data;
    }
};

// Calculates aggregate metrics from a set of daily records
const calculateMetrics = (data: DailyRecord[]): CalculatedMetrics => {
  const metrics = data.reduce(
    (acc, record) => {
      acc.totalLeads += record.novosLeads;
      acc.totalSql += record.sql;
      acc.totalContratosFechados += record.contratosFechados;
      // Fix: Corrected property name from 'valorTotalContratos' to 'valorContratos' to match DailyRecord type.
      acc.valorTotalContratos += record.valorContratos;
      acc.totalAssinados += record.assinado;
      acc.totalPago += record.pago;
      acc.totalPago5d += record.pago5d;
      return acc;
    },
    {
      totalLeads: 0, totalSql: 0, totalContratosFechados: 0, valorTotalContratos: 0,
      totalAssinados: 0, totalPago: 0, totalPago5d: 0, cpa: 0, taxaConversao: 0,
    }
  );

  metrics.taxaConversao = metrics.totalSql > 0 ? metrics.totalContratosFechados / metrics.totalSql : 0;
  metrics.cpa = metrics.totalAssinados > 0 ? metrics.totalPago / metrics.totalAssinados : 0;

  return metrics;
};


// --- RANKING CARD COMPONENT ---

const RankingCard: React.FC<{ salesperson: Salesperson & { metrics: CalculatedMetrics }, rank: number }> = ({ salesperson, rank }) => {
    const rankStyles = {
        1: { container: 'scale-110 z-10', border: 'border-blue-400', background: 'bg-transparent', textColor: 'text-blue-400', animation: 'pulse-glow-blue' },
        2: { container: 'translate-x-[20rem] xl:translate-x-[26rem]', border: 'border-gray-500', background: 'bg-transparent', textColor: 'text-gray-500', animation: '' },
        3: { container: 'translate-x-[-20rem] xl:translate-x-[-26rem]', border: 'border-gray-500', background: 'bg-transparent', textColor: 'text-gray-500', animation: '' },
    };

    const styles = rankStyles[rank as keyof typeof rankStyles] || rankStyles[3];

    return (
        <div className={`absolute w-full max-w-sm transform transition-transform duration-500 ${styles.container}`}>
            <div className={`relative ${styles.background} p-6 rounded-2xl border ${styles.border} text-center ${styles.animation}`}>
                <div className="absolute top-0 right-4">
                     <div className={`text-7xl font-black ${styles.textColor} opacity-20 -mt-2`}>
                        {rank}
                    </div>
                </div>
                <img
                    src={salesperson.photoUrl || `https://ui-avatars.com/api/?name=${salesperson.name}&background=4A5568&color=fff`}
                    alt={salesperson.name}
                    className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-700"
                />
                <h3 className="text-2xl font-bold text-white">{salesperson.name}</h3>
                <div className="mt-4 space-y-3 text-left">
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-400">Valor Pago</span>
                        <span className="text-xl font-bold text-white">R$ {salesperson.metrics.totalPago.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-400">Contratos Fechados</span>
                        <span className="text-xl font-bold text-white">{salesperson.metrics.totalContratosFechados}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-400">Taxa Conversão</span>
                        <span className="text-xl font-bold text-green-400">{(salesperson.metrics.taxaConversao * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---

interface DashboardProps {
  salespeople: Salesperson[];
  loading: boolean;
  error: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ salespeople, loading, error }) => {
    const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('all');
    const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.Month);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const periodLabels: Record<TimePeriod, string> = {
        [TimePeriod.Day]: 'Dia',
        [TimePeriod.Week]: 'Semana',
        [TimePeriod.Month]: 'Mês',
    };

    // Memoize calculations for performance
    const salespeopleWithPeriodData = useMemo(() =>
        salespeople.map(sp => ({
            ...sp,
            data: filterDataByPeriod(sp.data, timePeriod),
        })),
    [salespeople, timePeriod]);

    const rankedSalespeople = useMemo(() => {
        const withMetrics = salespeopleWithPeriodData.map(sp => ({
            ...sp,
            metrics: calculateMetrics(sp.data),
        }));
        return withMetrics.sort((a, b) => b.metrics.totalPago - a.metrics.totalPago);
    }, [salespeopleWithPeriodData]);

    const { dataForMetrics, dataForChart, selectedSalespersonObject } = useMemo(() => {
        let data: DailyRecord[];
        let spObject: (Salesperson & { metrics: CalculatedMetrics }) | null = null;
        if (selectedSalespersonId === 'all') {
            const allData = salespeopleWithPeriodData.flatMap(sp => sp.data);
            const aggregated: { [key: number]: DailyRecord } = {};
            allData.forEach(rec => {
                if (!aggregated[rec.dia]) {
                    aggregated[rec.dia] = { ...rec, novosLeads: 0, sql: 0, pago: 0, contratosFechados: 0, assinado: 0, valorContratos: 0, pago5d: 0 };
                }
                aggregated[rec.dia].novosLeads += rec.novosLeads;
                aggregated[rec.dia].sql += rec.sql;
                aggregated[rec.dia].pago += rec.pago;
                aggregated[rec.dia].contratosFechados += rec.contratosFechados;
            });
            data = Object.values(aggregated).sort((a,b) => a.dia - b.dia);
        } else {
            spObject = rankedSalespeople.find(sp => sp.id === selectedSalespersonId) || null;
            data = spObject ? spObject.data : [];
        }
        return { dataForMetrics: data, dataForChart: data, selectedSalespersonObject: spObject };
    }, [selectedSalespersonId, salespeopleWithPeriodData, rankedSalespeople]);

    const displayedMetrics = useMemo(() => calculateMetrics(dataForMetrics), [dataForMetrics]);

    const chartData = useMemo(() => dataForChart.map(d => ({
        label: `Dia ${d.dia}`,
        'Novos Leads': d.novosLeads,
        'Leads Qualificados': d.sql,
        'Pagamentos': d.pago,
    })), [dataForChart]);

    const selectedSalespersonName = selectedSalespersonId === 'all' ? 'Todas as Vendedoras' : salespeople.find(s => s.id === selectedSalespersonId)?.name;


    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    }
    if (error) {
        return <div className="text-center p-8 bg-red-500/10 text-red-400 rounded-lg">{error}</div>;
    }
    if (!salespeople || salespeople.length === 0) {
        return <div className="text-center p-8 bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold text-white">Nenhuma Vendedora Encontrada</h2><p className="text-gray-400 mt-2">Adicione vendedoras para começar.</p></div>;
    }

    const [first, second, third] = rankedSalespeople;

    return (
        <div className="space-y-16">
            {/* --- Ranking Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-10 text-center">Ranking de Performance</h2>
                {rankedSalespeople.length > 0 && (
                    <div className="relative flex justify-center items-center h-96">
                        {second && <RankingCard salesperson={second} rank={2} />}
                        {first && <RankingCard salesperson={first} rank={1} />}
                        {third && <RankingCard salesperson={third} rank={3} />}
                    </div>
                )}
            </section>
            
            {/* --- Metrics Section --- */}
            <section>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-white">Métricas</h2>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Time Period Filter */}
                        <div className="flex items-center bg-gray-700 rounded-lg p-1">
                            {(Object.values(TimePeriod) as TimePeriod[]).map(period => (
                                <button 
                                    key={period} 
                                    onClick={() => setTimePeriod(period)} 
                                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timePeriod === period ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {periodLabels[period]}
                                </button>
                            ))}
                        </div>
                        {/* Salesperson Filter */}
                        <div className="relative">
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                                {selectedSalespersonName}
                                <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-xl z-20">
                                    <a onClick={() => { setSelectedSalespersonId('all'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-white hover:bg-gray-600 cursor-pointer">Todas</a>
                                    {salespeople.map(sp => (
                                        <a key={sp.id} onClick={() => { setSelectedSalespersonId(sp.id); setIsDropdownOpen(false); }} className="block px-4 py-2 text-white hover:bg-gray-600 cursor-pointer">{sp.name}</a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<UsersIcon className="h-6 w-6" />} title="Novos Leads" value={displayedMetrics.totalLeads.toLocaleString('pt-BR')} />
                    <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} title="Leads Qualificados (SQL)" value={displayedMetrics.totalSql.toLocaleString('pt-BR')} />
                    <StatCard icon={<ChartBarIcon className="h-6 w-6" />} title="Contratos Fechados" value={displayedMetrics.totalContratosFechados.toLocaleString('pt-BR')} />
                    <StatCard icon={<CurrencyDollarIcon className="h-6 w-6" />} title="Pagamentos (Total)" value={`R$ ${displayedMetrics.totalPago.toLocaleString('pt-BR')}`} />
                </div>
            </section>
            
            {/* --- Chart & AI Section --- */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-3">
                     <PerformanceChart data={chartData} title={`Evolução Diária - ${selectedSalespersonName}`} height={350} />
                 </div>
                 {selectedSalespersonObject && (
                     <div className="lg:col-span-3">
                         <AIAnalysisCard salesperson={selectedSalespersonObject} metrics={selectedSalespersonObject.metrics} />
                     </div>
                 )}
            </div>
        </div>
    );
};

export default Dashboard;