import { BookRecord, BankRecord } from '../types';

// Helper to clean currency string like "2,080.00" to number 2080.00
const parseAmount = (str: string): number => {
  if (!str) return 0;
  return parseFloat(str.replace(/,/g, '').replace(/"/g, ''));
};

// Helper to remove quotes
const cleanStr = (str: string): string => {
  if (!str) return '';
  return str.replace(/"/g, '').trim();
};

export const parseBookCSV = (csvText: string): BookRecord[] => {
  const lines = csvText.split('\n');
  const records: BookRecord[] = [];
  
  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple regex for CSV splitting considering quotes
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; 
    const cols = line.split(regex).map(cleanStr);

    if (cols.length >= 4) {
      records.push({
        document_no: cols[0],
        posting_date: cols[1],
        description: cols[2], // In user data, invoice num is often here
        amount: parseAmount(cols[3]),
        originalIndex: i
      });
    }
  }
  return records;
};

export const parseBankCSV = (csvText: string): BankRecord[] => {
  const lines = csvText.split('\n');
  const records: BankRecord[] = [];

  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Regex to split by comma but ignore commas inside quotes
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const cols = line.split(regex).map(cleanStr);

    // Based on user sample: 
    // account_no[0], settlement_date[1], transaction_date[2], time[3], invoice_number[4], ..., total_amount[10]
    if (cols.length >= 11) {
      records.push({
        account_no: cols[0],
        transaction_date: cols[2],
        time: cols[3],
        invoice_number: cols[4],
        product: cols[5],
        total_amount: parseAmount(cols[10]),
        merchant_id: cols[13] || '',
        fuel_brand: cols[14] || '',
        originalIndex: i
      });
    }
  }
  return records;
};
