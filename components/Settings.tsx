import React, { useState, useEffect } from 'react';
import { Salesperson } from '../types';
import { parseSpreadsheet } from '../services/spreadsheetParser';
import { UploadIcon, PencilIcon, TrashIcon, PlusIcon } from './Icons';

interface SettingsProps {
  salespeople: Salesperson[];
  onSalespeopleChange: (updatedSalespeople: Salesperson[]) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onClearAllData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ salespeople, onSalespeopleChange, addNotification, onClearAllData }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [targetSalespersonId, setTargetSalespersonId] = useState<string>('');
    
    // State for the Add/Edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null);
    const [formData, setFormData] = useState({ name: '', photoUrl: '', googleSheetId: '' });
    
    // State for the Clear Data confirmation modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        // Pre-select first salesperson for manual upload if available
        if (!targetSalespersonId && salespeople.length > 0) {
            setTargetSalespersonId(salespeople[0].id);
        }
    }, [salespeople, targetSalespersonId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };
    
    const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !targetSalespersonId) {
            addNotification('Por favor, selecione um arquivo e uma vendedora.', 'error');
            return;
        }

        setIsUploading(true);
        try {
            const parsedData = await parseSpreadsheet(selectedFile);
            const updatedSalespeople = salespeople.map(sp =>
                sp.id === targetSalespersonId ? { ...sp, data: parsedData } : sp
            );
            onSalespeopleChange(updatedSalespeople);
            addNotification(`Dados para ${salespeople.find(sp => sp.id === targetSalespersonId)?.name} atualizados com sucesso!`, 'success');
            setSelectedFile(null);
        } catch (error: any) {
            addNotification(error.message || 'Ocorreu um erro ao processar a planilha.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // --- CRUD functions for salespeople ---

    const openModal = (salesperson: Salesperson | null) => {
        setEditingSalesperson(salesperson);
        if (salesperson) {
            setFormData({
                name: salesperson.name,
                photoUrl: salesperson.photoUrl,
                googleSheetId: salesperson.googleSheetId || '',
            });
        } else {
            setFormData({ name: '', photoUrl: '', googleSheetId: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSalesperson(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSalesperson = () => {
        if (!formData.name) {
            addNotification('O nome da vendedora é obrigatório.', 'error');
            return;
        }

        if (editingSalesperson) {
            // Update existing salesperson
            const updatedSalespeople = salespeople.map(sp =>
                sp.id === editingSalesperson.id
                    ? { ...sp, ...formData, initial: formData.name.charAt(0).toUpperCase() }
                    : sp
            );
            onSalespeopleChange(updatedSalespeople);
            addNotification('Vendedora atualizada com sucesso!', 'success');
        } else {
            // Add new salesperson
            const newSalesperson: Salesperson = {
                id: Date.now().toString(),
                name: formData.name,
                initial: formData.name.charAt(0).toUpperCase(),
                photoUrl: formData.photoUrl || `https://i.pravatar.cc/150?u=${formData.name}`,
                googleSheetId: formData.googleSheetId,
                data: [],
            };
            onSalespeopleChange([...salespeople, newSalesperson]);
            addNotification('Vendedora adicionada com sucesso!', 'success');
        }
        closeModal();
    };

    const handleDeleteSalesperson = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta vendedora? Esta ação não pode ser desfeita.')) {
            const updatedSalespeople = salespeople.filter(sp => sp.id !== id);
            onSalespeopleChange(updatedSalespeople);
            addNotification('Vendedora excluída com sucesso.', 'success');
        }
    };
    
    // --- Clear Data Logic ---
    const handleClearClick = () => {
        const hasDataToClear = salespeople.some(sp => sp.data && sp.data.length > 0);
        if (!hasDataToClear) {
            addNotification('Não existem dados para excluir.', 'info');
            return;
        }
        setIsConfirmModalOpen(true);
    };

    const handleConfirmClear = () => {
        onClearAllData();
        setIsConfirmModalOpen(false);
    };

    return (
        <>
            <div className="space-y-12">
                {/* Manage Salespeople Section */}
                <div className="bg-gray-800/70 p-8 rounded-xl border border-gray-700/50">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Vendedoras</h2>
                            <p className="text-gray-400">Adicione, edite ou remova vendedoras do painel.</p>
                        </div>
                        <button onClick={() => openModal(null)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <PlusIcon className="h-5 w-5" />
                            Adicionar Vendedora
                        </button>
                    </div>
                    <div className="space-y-4">
                        {salespeople.map(sp => (
                            <div key={sp.id} className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-4">
                                    <img src={sp.photoUrl} alt={sp.name} className="h-10 w-10 rounded-full object-cover" />
                                    <span className="font-medium text-white">{sp.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => openModal(sp)} className="text-gray-400 hover:text-white transition-colors" title="Editar">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteSalesperson(sp.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                         {salespeople.length === 0 && (
                            <div className="text-center py-8 text-gray-500">Nenhuma vendedora cadastrada.</div>
                         )}
                    </div>
                </div>
                
                {/* Spreadsheet Upload Section */}
                <div className="bg-gray-800/70 p-8 rounded-xl border border-gray-700/50">
                    <h2 className="text-3xl font-bold text-white mb-2">Importar Dados (Manual)</h2>
                    <p className="text-gray-400 mb-6">Faça o upload do arquivo .xlsx para atualizar os dados de uma vendedora.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="col-span-1">
                            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Envie a Planilha (.xlsx)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none">
                                <span className="flex items-center space-x-2">
                                    <UploadIcon className="w-6 h-6 text-gray-400" />
                                    <span className="font-medium text-gray-400 truncate">
                                        {selectedFile ? selectedFile.name : 'Arraste ou clique para selecionar'}
                                    </span>
                                </span>
                                <input id="file-upload" name="file-upload" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div className="col-span-1">
                            <label htmlFor="salesperson-select" className="block text-sm font-medium text-gray-300 mb-2">2. Selecione a Vendedora</label>
                            <select
                                id="salesperson-select" value={targetSalespersonId} onChange={(e) => setTargetSalespersonId(e.target.value)}
                                disabled={salespeople.length === 0}
                                className="w-full h-12 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {salespeople.length > 0 ? (
                                    salespeople.map(sp => (<option key={sp.id} value={sp.id}>{sp.name}</option>))
                                ) : (
                                    <option value="" disabled>Adicione uma vendedora</option>
                                )}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <button
                                onClick={handleUpload}
                                disabled={isUploading || !selectedFile || !targetSalespersonId}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isUploading ? 'Processando...' : 'Importar Dados'}
                            </button>
                        </div>
                    </div>
                </div>

                 {/* Data Management Section */}
                 <div className="bg-gray-800/70 p-8 rounded-xl border border-gray-700/50">
                    <h2 className="text-3xl font-bold text-white mb-2">Gerenciamento de Dados</h2>
                    <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-red-400">Zerar Todos os Dados</h3>
                            <p className="text-sm text-gray-400 mt-1">Esta ação limpará permanentemente todas as métricas de todas as vendedoras. Use com cuidado.</p>
                        </div>
                        <button
                            onClick={handleClearClick}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Zerar Dados
                        </button>
                    </div>
                </div>

            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingSalesperson ? 'Editar Vendedora' : 'Adicionar Vendedora'}</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveSalesperson(); }}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Foto</label>
                                    <div className="flex items-center gap-4">
                                        <img src={formData.photoUrl || 'https://i.pravatar.cc/150?u=new'} alt="Avatar" className="h-16 w-16 rounded-full object-cover bg-gray-700"/>
                                        <div className="w-full">
                                            <input type="text" name="photoUrl" placeholder="Cole a URL da imagem aqui" value={formData.photoUrl} onChange={handleFormChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                            <p className="text-xs text-center text-gray-500 my-2">ou</p>
                                             <label htmlFor="photo-upload" className="w-full text-center cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors block">
                                                Enviar do Computador
                                            </label>
                                            <input id="photo-upload" name="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoFileChange} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="googleSheetId" className="block text-sm font-medium text-gray-300 mb-1">ID da Planilha Google</label>
                                    <input type="text" name="googleSheetId" id="googleSheetId" value={formData.googleSheetId} onChange={handleFormChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 1a2b3c4d5e..." />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">Cancelar</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Clear Data Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-yellow-500/50 rounded-xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-yellow-300 mb-4">Confirmar Ação</h2>
                        <p className="text-gray-300 mb-6">
                            Você tem certeza que deseja zerar todos os dados de vendas? 
                            <br/>
                            <strong className="text-red-400">Esta ação é irreversível.</strong>
                        </p>
                        <div className="mt-8 flex justify-end gap-4">
                            <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">Cancelar</button>
                            <button type="button" onClick={handleConfirmClear} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Sim, Zerar Dados</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Settings;