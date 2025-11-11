import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, description, className = '' }) => {
  return (
    <div className={`bg-gray-800/70 p-5 rounded-xl border border-gray-700/50 shadow-lg backdrop-blur-sm transform hover:-translate-y-1 transition-transform duration-300 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="bg-gray-700 p-3 rounded-lg text-blue-400">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
  );
};

export default StatCard;