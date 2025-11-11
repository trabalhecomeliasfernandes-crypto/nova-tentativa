import { Salesperson, DailyRecord } from '../types';

// Mock data generation function
export const generateMockData = (baseLeads: number, sqlRate: number, conversionRate: number): DailyRecord[] => {
  const data: DailyRecord[] = [];
  const daysOfWeek = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
  
  for (let i = 1; i <= 30; i++) {
    const novosLeads = Math.floor(baseLeads + (Math.random() - 0.5) * 10);
    const sql = Math.floor(novosLeads * (sqlRate + (Math.random() - 0.5) * 0.1));
    const contratosFechados = Math.floor(sql * (conversionRate + (Math.random() - 0.5) * 0.1));
    
    const pago = contratosFechados * 997 * (0.8 + Math.random() * 0.2);
    const pago5d = pago * (0.3 + Math.random() * 0.2); // Subset of pago

    data.push({
      dia: i,
      data: daysOfWeek[i % 7],
      novosLeads: Math.max(0, novosLeads),
      sql: Math.max(0, sql),
      contratosFechados: Math.max(0, contratosFechados),
      assinado: Math.max(0, contratosFechados),
      pago5d: Math.round(pago5d),
      pago: Math.round(pago),
      valorContratos: (Math.floor(contratosFechados / 2) * 1299) + (Math.ceil(contratosFechados / 2) * 997),
    });
  }
  return data;
};


const MOCK_SALESPEOPLE: Salesperson[] = [
  {
    id: 'andresa',
    name: 'Andresa',
    initial: 'A',
    photoUrl: 'https://i.pravatar.cc/150?u=andresa',
    data: generateMockData(30, 0.4, 0.25), // High leads, decent conversion
    googleSheetId: '',
  },
  {
    id: 'jennifer',
    name: 'Jennifer',
    initial: 'J',
    photoUrl: 'https://i.pravatar.cc/150?u=jennifer',
    data: generateMockData(25, 0.5, 0.35), // Fewer leads, higher quality
    googleSheetId: '',
  },
  {
    id: 'lohaynni',
    name: 'Lohaynni',
    initial: 'L',
    photoUrl: 'https://i.pravatar.cc/150?u=lohaynni',
    data: generateMockData(35, 0.3, 0.18), // High volume, lower conversion
    googleSheetId: '',
  },
];


export const fetchAllSalesData = async (): Promise<Salesperson[]> => {
  // In a real application, this function would make an API call to a backend
  // which in turn fetches data from Google Sheets for each salesperson.
  // We use a timeout to simulate network latency.
  return new Promise(resolve => {
    const dataFromStorage = localStorage.getItem('salespeople');
    if (dataFromStorage) {
        resolve(JSON.parse(dataFromStorage));
    } else {
        localStorage.setItem('salespeople', JSON.stringify(MOCK_SALESPEOPLE));
        resolve(JSON.parse(JSON.stringify(MOCK_SALESPEOPLE)));
    }
  });
};