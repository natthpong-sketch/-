import { BankRecord, BookRecord, ReconciliationResult, MatchStatus, SummaryStats, SuggestedFix } from '../types';

// Helper: Check for transposition error (e.g. 5400 vs 4500)
const isTransposition = (val1: number, val2: number): boolean => {
  const s1 = Math.round(val1 * 100).toString();
  const s2 = Math.round(val2 * 100).toString();
  
  if (s1.length !== s2.length) return false;
  
  let diffIndices: number[] = [];
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] !== s2[i]) diffIndices.push(i);
  }
  
  // Must have exactly 2 differences adjacent to each other (or close)
  if (diffIndices.length === 2) {
    const [i, j] = diffIndices;
    // Check if swapping characters fixes it
    if (s1[i] === s2[j] && s1[j] === s2[i]) {
      return true;
    }
  }
  return false;
};

// Helper: Check for digit shift (e.g. 5000 vs 500)
const isDigitShift = (val1: number, val2: number): boolean => {
  const ratio = val1 / val2;
  return Math.abs(ratio - 10) < 0.01 || Math.abs(ratio - 0.1) < 0.01;
};

export const reconcileData = (bankData: BankRecord[], bookData: BookRecord[]): { results: ReconciliationResult[], stats: SummaryStats } => {
  const results: ReconciliationResult[] = [];
  const bookMatchedIndices = new Set<number>();
  const bankMatchedIndices = new Set<number>();

  // --- PASS 1: Exact Match (Invoice Number AND Amount) ---
  bankData.forEach((bankItem, bankIdx) => {
    const exactMatchIndex = bookData.findIndex((bookItem, bookIdx) => {
      if (bookMatchedIndices.has(bookIdx)) return false;
      
      const amtMatch = Math.abs(bankItem.total_amount - bookItem.amount) < 0.01;
      const invMatch = bookItem.description === bankItem.invoice_number; 

      return amtMatch && invMatch;
    });

    if (exactMatchIndex !== -1) {
      const bookItem = bookData[exactMatchIndex];
      results.push({
        id: `match-${bankItem.invoice_number}`,
        bankRecord: bankItem,
        bookRecord: bookItem,
        status: MatchStatus.MATCHED,
        score: 100,
        note: 'ข้อมูลตรงกันสมบูรณ์'
      });
      bankMatchedIndices.add(bankIdx);
      bookMatchedIndices.add(exactMatchIndex);
    }
  });

  // --- PASS 2: Human Error Detection (Invoice Matches, but Amount Wrong) ---
  bankData.forEach((bankItem, bankIdx) => {
    if (bankMatchedIndices.has(bankIdx)) return;

    const errorMatchIndex = bookData.findIndex((bookItem, bookIdx) => {
      if (bookMatchedIndices.has(bookIdx)) return false;
      // Strict Invoice Match
      return bookItem.description === bankItem.invoice_number;
    });

    if (errorMatchIndex !== -1) {
      const bookItem = bookData[errorMatchIndex];
      let fix: SuggestedFix | undefined;
      let note = 'เลขที่เอกสารตรงกัน แต่ยอดเงินไม่ตรง';
      let confidence: 'HIGH' | 'MEDIUM' = 'MEDIUM';

      // 2.1 Transposition Check
      if (isTransposition(bankItem.total_amount, bookItem.amount)) {
        fix = {
          type: 'TRANSPOSITION',
          description: 'ตรวจพบตัวเลขสลับหลัก (Transposition)',
          correction: `แก้ไข Book จาก ${bookItem.amount} เป็น ${bankItem.total_amount}`,
          confidence: 'HIGH'
        };
        note = 'ตัวเลขสลับหลัก?';
        confidence = 'HIGH';
      }
      // 2.2 Digit Shift (e.g. 500 vs 5000)
      else if (isDigitShift(bankItem.total_amount, bookItem.amount)) {
         fix = {
          type: 'DIGIT_ERROR',
          description: 'หลักตัวเลขไม่ถูกต้อง (Digit Shift)',
          correction: `แก้ไข Book จาก ${bookItem.amount} เป็น ${bankItem.total_amount}`,
          confidence: 'HIGH'
        };
        note = 'ใส่จำนวนหลักผิด?';
        confidence = 'HIGH';
      }
      // 2.3 Small Diff (VAT/Fee)
      else if (Math.abs(bankItem.total_amount - bookItem.amount) < 10) {
        fix = {
          type: 'SMALL_DIFF',
          description: 'ผลต่างยอดเงินเล็กน้อย',
          correction: `ปรับปรุงยอดผลต่าง ${Math.abs(bankItem.total_amount - bookItem.amount).toFixed(2)} บาท`,
          confidence: 'MEDIUM'
        };
        note = 'ยอดต่างกันเล็กน้อย';
      }
      // 2.4 General Amount Error
      else {
        fix = {
          type: 'OTHER',
          description: 'ยอดเงินไม่ตรงกัน (Keying Error)',
          correction: `แก้ไข Book ให้ตรงกับ Bank (${bankItem.total_amount})`,
          confidence: 'MEDIUM'
        };
      }

      results.push({
        id: `smart-fix-${bankIdx}`,
        bankRecord: bankItem,
        bookRecord: bookItem,
        status: MatchStatus.POTENTIAL_MATCH,
        score: confidence === 'HIGH' ? 90 : 70,
        note: note,
        suggestedFix: fix
      });

      bankMatchedIndices.add(bankIdx);
      bookMatchedIndices.add(errorMatchIndex);
    }
  });

  // --- PASS 3: Fuzzy Match (Amount Matches, Invoice/Date Mismatch) ---
  bankData.forEach((bankItem, bankIdx) => {
    if (bankMatchedIndices.has(bankIdx)) return;

    const fuzzyMatchIndex = bookData.findIndex((bookItem, bookIdx) => {
      if (bookMatchedIndices.has(bookIdx)) return false;

      const amtMatch = Math.abs(bankItem.total_amount - bookItem.amount) < 0.01;
      
      // If Amount matches perfectly but Invoice doesn't -> Potential Match
      if (amtMatch) return true;

      return false;
    });

    if (fuzzyMatchIndex !== -1) {
      const bookItem = bookData[fuzzyMatchIndex];
      results.push({
        id: `fuzzy-${bankIdx}-${fuzzyMatchIndex}`,
        bankRecord: bankItem,
        bookRecord: bookItem,
        status: MatchStatus.POTENTIAL_MATCH,
        score: 60,
        note: 'ยอดเงินตรงกัน (แต่เลขที่เอกสารไม่ตรง)',
        suggestedFix: {
            type: 'OTHER',
            description: 'อาจบันทึกเลขที่เอกสารผิด',
            correction: `แก้ไข Description เป็น ${bankItem.invoice_number}`,
            confidence: 'LOW'
        }
      });
      bankMatchedIndices.add(bankIdx);
      bookMatchedIndices.add(fuzzyMatchIndex);
    }
  });

  // --- Collect Unmatched Bank ---
  bankData.forEach((bankItem, idx) => {
    if (!bankMatchedIndices.has(idx)) {
      results.push({
        id: `un-bank-${idx}`,
        bankRecord: bankItem,
        status: MatchStatus.UNMATCHED_BANK,
        score: 0,
        note: 'ไม่พบข้อมูลในระบบบัญชี (Book)'
      });
    }
  });

  // --- Collect Unmatched Book ---
  bookData.forEach((bookItem, idx) => {
    if (!bookMatchedIndices.has(idx)) {
      results.push({
        id: `un-book-${idx}`,
        bookRecord: bookItem,
        status: MatchStatus.UNMATCHED_BOOK,
        score: 0,
        note: 'ไม่พบข้อมูลในรายการเดินบัญชี (Bank)'
      });
    }
  });

  // Stats
  const totalBankAmount = bankData.reduce((sum, item) => sum + item.total_amount, 0);
  const totalBookAmount = bookData.reduce((sum, item) => sum + item.amount, 0);

  const stats: SummaryStats = {
    totalBank: bankData.length,
    totalBook: bookData.length,
    matchedCount: results.filter(r => r.status === MatchStatus.MATCHED).length,
    unmatchedBankCount: results.filter(r => r.status === MatchStatus.UNMATCHED_BANK).length,
    unmatchedBookCount: results.filter(r => r.status === MatchStatus.UNMATCHED_BOOK).length,
    totalBankAmount,
    totalBookAmount,
    diffAmount: totalBankAmount - totalBookAmount
  };

  return { results, stats };
};