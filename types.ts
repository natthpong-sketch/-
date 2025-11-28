export interface BookRecord {
  document_no: string;
  posting_date: string;
  description: string; // Often matches Invoice No in Bank
  amount: number;
  originalIndex: number;
}

export interface BankRecord {
  account_no: string;
  transaction_date: string;
  time: string;
  invoice_number: string;
  product: string;
  total_amount: number;
  merchant_id: string;
  fuel_brand: string;
  originalIndex: number;
}

export enum MatchStatus {
  MATCHED = 'MATCHED',
  UNMATCHED_BANK = 'UNMATCHED_BANK', // Found in Bank but not in Book
  UNMATCHED_BOOK = 'UNMATCHED_BOOK', // Found in Book but not in Bank
  POTENTIAL_MATCH = 'POTENTIAL_MATCH' // Fuzzy match (e.g. amount diff, date drift)
}

export interface SuggestedFix {
  type: 'TRANSPOSITION' | 'DIGIT_ERROR' | 'DATE_MISMATCH' | 'SMALL_DIFF' | 'OTHER';
  description: string;
  correction: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ReconciliationResult {
  id: string;
  bankRecord?: BankRecord;
  bookRecord?: BookRecord;
  status: MatchStatus;
  score: number; // 0-100 confidence
  note?: string;
  suggestedFix?: SuggestedFix;
}

export interface SummaryStats {
  totalBank: number;
  totalBook: number;
  matchedCount: number;
  unmatchedBankCount: number;
  unmatchedBookCount: number;
  totalBankAmount: number;
  totalBookAmount: number;
  diffAmount: number;
}