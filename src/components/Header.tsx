import React from 'react';
import { View } from '../types';
import { LogoutIcon, RefreshIcon } from './Icons';

interface HeaderProps {
  currentView: View;
  onNavClick: (view: View) => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
      isActive
        ? 'border-blue-500 text-white'
        : 'border-transparent text-gray-400 hover:text-white'
    }`}
  >
    {label}
  </button>
);


const Header: React.FC<HeaderProps> = ({ currentView, onNavClick, onLogout, onRefresh, isRefreshing }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
               <h1 className="text-2xl font-black text-blue-400 tracking-wider">RESCORE</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
                 <NavButton label="Dashboard" isActive={currentView === View.Dashboard} onClick={() => onNavClick(View.Dashboard)} />
                 <NavButton label="Configurações" isActive={currentView === View.Settings} onClick={() => onNavClick(View.Settings)} />
            </nav>
          </div>
          <div className="flex items-center space-x-4">
             <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                title="Atualizar dados do Google Sheets"
            >
                <RefreshIcon className="h-5 w-5" isSpinning={isRefreshing} />
                <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
            </button>
            <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                title="Sair da conta"
            >
                <LogoutIcon className="h-5 w-5" />
                <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;