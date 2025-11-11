export interface DailyRecord {
  dia: number;
  data: string;
  novosLeads: number;
  sql: number;
  contratosFechados: number;
  assinado: number;
  pago5d: number;
  pago: number;
  valorContratos: number;
}

export interface Salesperson {
  id: string;
  name: string;
  initial: string;
  photoUrl: string;
  data: DailyRecord[];
  googleSheetId?: string;
}

export interface CalculatedMetrics {
  totalLeads: number;
  totalSql: number;
  totalContratosFechados: number;
  valorTotalContratos: number;
  totalAssinados: number;
  totalPago: number;
  totalPago5d: number;
  cpa: number;
  taxaConversao: number;
}

export enum View {
  Dashboard = 'Dashboard',
  Settings = 'Settings',
}

export enum TimePeriod {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export interface NotificationType {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}