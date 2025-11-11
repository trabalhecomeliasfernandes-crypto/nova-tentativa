import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: {
    label: string;
    'Novos Leads'?: number;
    'Leads Qualificados'?: number;
    'Pagamentos'?: number;
  }[];
  height?: number;
  title: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title, height = 350 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <div style={{ height }} className="flex items-center justify-center">
          <p className="text-gray-500">Sem dados para exibir no período selecionado.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

  return (
      <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700/50 w-full">
         <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
         <ResponsiveContainer width="100%" height={height}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="label" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1F2937', // bg-gray-800
                        border: '1px solid #4B5563', // border-gray-600
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#F9FAFB' }} // text-gray-50
                    formatter={(value: number, name: string) => (name === 'Pagamentos' ? formatCurrency(value) : value)}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="Novos Leads" stroke="#64748B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Leads Qualificados" stroke="#9CA3AF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Pagamentos" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
      </div>
  );
};

export default PerformanceChart;