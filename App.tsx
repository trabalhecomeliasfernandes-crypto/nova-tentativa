import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllSalesData } from './services/salesDataService';
import { refreshDataFromGoogleSheets } from './services/googleSheetsService';
import { Salesperson, View, NotificationType } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Login from './components/Login';
import Ticker from './components/Ticker';
import Notification from './components/Notification';

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
    const [currentView, setCurrentView] = useState<View>(View.Dashboard);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    
    // Security for Settings
    const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordAttempt, setPasswordAttempt] = useState('');


    // --- DATA FETCHING ---
    const loadSalesData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAllSalesData();
            setSalespeople(data);
        } catch (err) {
            setError("Failed to load sales data. Please try again later.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            loadSalesData();
        }
    }, [isLoggedIn, loadSalesData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            const data = await refreshDataFromGoogleSheets();
            setSalespeople(data);
            addNotification("Dados atualizados com sucesso!", 'success');
        } catch (err) {
            setError("Failed to refresh data.");
            addNotification("Falha ao atualizar os dados.", 'error');
            console.error(err);
        } finally {
            setIsRefreshing(false);
        }
    };

    // --- NOTIFICATION HANDLERS ---
    const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        const newNotification: NotificationType = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };


    // --- EVENT HANDLERS ---
    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        addNotification('Login realizado com sucesso!', 'success');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setSalespeople([]);
        setCurrentView(View.Dashboard);
        setIsSettingsUnlocked(false); // Lock settings on logout
    };
    
    const handleSalespeopleChange = (updatedSalespeople: Salesperson[]) => {
        setSalespeople(updatedSalespeople);
        // Persist changes to local storage
        localStorage.setItem('salespeople', JSON.stringify(updatedSalespeople));
    }

    const handleClearAllData = () => {
        // This function now only performs the data clearing action.
        // The confirmation and pre-check logic is handled in the Settings component.
        const clearedSalespeople = salespeople.map(sp => ({ ...sp, data: [] }));
        setSalespeople(clearedSalespeople);
        localStorage.setItem('salespeople', JSON.stringify(clearedSalespeople));
        addNotification('Todos os dados foram zerados com sucesso.', 'success');
    };
    
    const handleNavClick = (view: View) => {
        if (view === View.Settings) {
            if (isSettingsUnlocked) {
                setCurrentView(View.Settings);
            } else {
                setIsPasswordModalOpen(true);
            }
        } else {
            setCurrentView(view);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordAttempt === 'MDubai0384#') {
            setIsSettingsUnlocked(true);
            setCurrentView(View.Settings);
            setIsPasswordModalOpen(false);
            setPasswordAttempt('');
            addNotification('Acesso concedido!', 'success');
        } else {
            addNotification('Senha incorreta.', 'error');
            setPasswordAttempt('');
        }
    };


    // --- RENDER LOGIC ---
    if (!isLoggedIn) {
        return <Login onLoginSuccess={handleLoginSuccess} addNotification={addNotification} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header
                currentView={currentView}
                onNavClick={handleNavClick}
                onLogout={handleLogout}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
            />

            <Ticker salespeople={salespeople} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {currentView === View.Dashboard && (
                    <Dashboard salespeople={salespeople} loading={isLoading} error={error} />
                )}
                {currentView === View.Settings && (
                    <Settings 
                        salespeople={salespeople} 
                        onSalespeopleChange={handleSalespeopleChange}
                        addNotification={addNotification}
                        onClearAllData={handleClearAllData}
                    />
                )}
            </main>

            {/* Notification Container */}
            <div className="fixed bottom-5 right-5 z-50 space-y-3">
                {notifications.map(n => (
                    <Notification
                        key={n.id}
                        message={n.message}
                        type={n.type}
                        onClose={() => removeNotification(n.id)}
                    />
                ))}
            </div>
            
            {/* Settings Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 w-full max-w-sm">
                        <h2 className="text-2xl font-bold text-white mb-6">Acesso Restrito</h2>
                        <p className="text-gray-400 mb-4">Por favor, insira a senha para acessar as configurações.</p>
                        <form onSubmit={handlePasswordSubmit}>
                            <input
                                type="password"
                                value={passwordAttempt}
                                onChange={(e) => setPasswordAttempt(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Senha"
                                required
                                autoFocus
                            />
                            <div className="mt-6 flex justify-end gap-4">
                                <button type="button" onClick={() => { setIsPasswordModalOpen(false); setPasswordAttempt(''); }} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">Cancelar</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Entrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;