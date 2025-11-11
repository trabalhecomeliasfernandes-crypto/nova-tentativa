import { DailyRecord } from '../types';
import * as XLSX from 'xlsx';

const getCellNumber = (cell: XLSX.CellObject | undefined): number => {
    if (!cell) return 0;
    // Prioritize raw value if it's a number
    if (typeof cell.v === 'number') {
        return cell.v;
    }
    // Fallback to parsing the formatted string value (.w)
    if (cell.w !== null && cell.w !== undefined) {
         const num = parseInt(String(cell.w).trim(), 10);
         return isNaN(num) ? 0 : num;
    }
    // Last resort, try the raw value again with conversion
    if (cell.v !== null && cell.v !== undefined) {
        const num = parseInt(String(cell.v).trim(), 10);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};


const getCellString = (cell: XLSX.CellObject | undefined): string => {
    if (!cell || cell.w === null || cell.w === undefined) return '';
    return String(cell.w).trim();
};

const parseCurrency = (cell: XLSX.CellObject | undefined): number => {
    if (!cell) return 0;
    // Prioritize the raw numeric value if it's a number
    if (typeof cell.v === 'number') {
        return cell.v;
    }
    // Fallback to parsing the formatted string value (.w)
    if (typeof cell.w === 'string') {
        const cleanedValue = cell.w.replace(/[R$\s.]/g, '').replace(',', '.').trim();
        const num = parseFloat(cleanedValue);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

export const parseSpreadsheet = async (file: File): Promise<DailyRecord[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'buffer', cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    if (!worksheet) {
        throw new Error("Não foi possível encontrar uma planilha no arquivo.");
    }

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const endRow = range.e.r; // 0-indexed last row

    const now = new Date();
    const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const parsedData: DailyRecord[] = [];
    const DATA_START_ROW = 6;

    for (let rowNum = DATA_START_ROW - 1; rowNum <= endRow; rowNum++) {
        const getCell = (col: string) => worksheet[`${col}${rowNum + 1}`];

        const dayCell = getCell('E');
        const diaNum = getCellNumber(dayCell);

        // This is the main validation for a row to be considered valid data
        if (diaNum < 1 || diaNum > daysInCurrentMonth) {
            continue; // Skip invalid or empty rows
        }

        const c1299_c = getCellNumber(getCell('K'));
        const c997_c = getCellNumber(getCell('S'));
        const c847_c = getCellNumber(getCell('AA'));
        const totalContratosFechados = c1299_c + c997_c + c847_c;
        const valorContratos = (c1299_c * 1299) + (c997_c * 997) + (c847_c * 847);

        const c1299_a = getCellNumber(getCell('M'));
        const c997_a = getCellNumber(getCell('U'));
        const c847_a = getCellNumber(getCell('AC'));
        const totalAssinados = c1299_a + c997_a + c847_a;
        
        const record: DailyRecord = {
            dia: diaNum,
            data: getCellString(getCell('C')),
            novosLeads: getCellNumber(getCell('G')),
            sql: getCellNumber(getCell('I')),
            contratosFechados: totalContratosFechados,
            assinado: totalAssinados,
            pago5d: parseCurrency(getCell('AE')),
            pago: parseCurrency(getCell('AG')),
            valorContratos: valorContratos,
        };
        parsedData.push(record);
    }

    if (parsedData.length === 0) {
        throw new Error(`Nenhuma linha de dados válida foi encontrada. Verifique se a coluna 'E' contém os dias do mês (números de 1 a ${daysInCurrentMonth}) a partir da linha 6.`);
    }

    return parsedData;
};