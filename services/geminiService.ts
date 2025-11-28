import { GoogleGenAI } from "@google/genai";
import { ReconciliationResult, MatchStatus, SummaryStats } from "../types";

// Initialize using the new SDK pattern
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Existing function for quick row-level analysis
export const analyzeDiscrepancies = async (results: ReconciliationResult[]): Promise<string> => {
  const unmatchedBank = results.filter(r => r.status === MatchStatus.UNMATCHED_BANK).slice(0, 10);
  const unmatchedBook = results.filter(r => r.status === MatchStatus.UNMATCHED_BOOK).slice(0, 10);
  const potentialErrors = results.filter(r => r.status === MatchStatus.POTENTIAL_MATCH && r.suggestedFix?.confidence === 'HIGH').slice(0, 5);

  if (unmatchedBank.length === 0 && unmatchedBook.length === 0 && potentialErrors.length === 0) {
    return "ไม่พบรายการที่ผิดปกติอย่างมีนัยสำคัญ ข้อมูลถูกต้องสมบูรณ์";
  }

  const prompt = `
    คุณคือผู้ตรวจสอบบัญชี AI (AI Financial Auditor) ที่เชี่ยวชาญด้านการตรวจจับข้อผิดพลาด
    
    หน้าที่ของคุณ:
    1. วิเคราะห์ "รายการที่ระบบตรวจพบว่าเป็น Human Error"
    2. วิเคราะห์รายการ Unmatched เพื่อหาคู่ที่อาจตกหล่น
    3. ให้คำแนะนำ "Smart Fix" สั้นๆ

    ข้อมูล:
    Potential Errors: ${JSON.stringify(potentialErrors.map(u => ({ invoice: u.bankRecord?.invoice_number, diff: (u.bankRecord?.total_amount||0) - (u.bookRecord?.amount||0) })))}
    Unmatched Bank: ${JSON.stringify(unmatchedBank.map(u => ({ date: u.bankRecord?.transaction_date, amount: u.bankRecord?.total_amount })))}
    Unmatched Book: ${JSON.stringify(unmatchedBook.map(u => ({ date: u.bookRecord?.posting_date, amount: u.bookRecord?.amount })))}

    สรุปผลสั้นๆ กระชับ เป็นภาษาไทย:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "ไม่สามารถวิเคราะห์ข้อมูลได้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";
  }
};

// NEW: Function for generating full Executive Report
export const generateExecutiveReport = async (results: ReconciliationResult[], stats: SummaryStats): Promise<string> => {
  // Calculate specific error stats
  const transpositionErrors = results.filter(r => r.suggestedFix?.type === 'TRANSPOSITION').length;
  const digitErrors = results.filter(r => r.suggestedFix?.type === 'DIGIT_ERROR').length;
  const dateMismatches = results.filter(r => r.status === MatchStatus.POTENTIAL_MATCH && !r.suggestedFix).length;
  
  const prompt = `
    คุณคือที่ปรึกษาทางการเงินอาวุโส (Senior Financial Consultant) ที่เชี่ยวชาญด้าน Process Improvement
    
    โปรดเขียนรายงานสรุปผลการกระทบยอด (Executive Summary Report) จากข้อมูลต่อไปนี้:

    **สถิติภาพรวม:**
    - รายการทั้งหมด: ${stats.totalBank + stats.totalBook}
    - จับคู่สำเร็จ: ${stats.matchedCount} (${((stats.matchedCount / (stats.totalBank + stats.totalBook)) * 100).toFixed(1)}%)
    - รายการไม่ตรงกัน (Unmatched): ${stats.unmatchedBankCount + stats.unmatchedBookCount}
    - ผลต่างยอดเงินรวม: ${stats.diffAmount.toLocaleString()} บาท

    **การวิเคราะห์ข้อผิดพลาด (Pattern Recognition):**
    - ความผิดพลาดประเภทตัวเลขสลับหลัก (Transposition): ${transpositionErrors} รายการ (บ่งชี้ถึง Manual Keying Error)
    - ความผิดพลาดประเภทใส่จำนวนหลักผิด (Digit Shift): ${digitErrors} รายการ
    - ความคลาดเคลื่อนอื่นๆ หรือวันที่ไม่ตรง: ${dateMismatches} รายการ

    **คำสั่ง:**
    สร้างรายงานวิเคราะห์เชิงลึกในรูปแบบ Markdown โดยแบ่งเป็นหัวข้อดังนี้ (ใช้ภาษาไทยทางการ):

    1. **บทสรุปผู้บริหาร (Executive Summary):** 
       - สรุปสถานะความถูกต้องของบัญชีในภาพรวม
       - ระดับความเสี่ยงจากข้อผิดพลาดที่พบ

    2. **วิเคราะห์เจาะลึกสาเหตุ (Root Cause Analysis):**
       - วิเคราะห์สาเหตุหลักของข้อผิดพลาด (เช่น เกิดจากคน, ระบบ, หรือเรื่องของเวลา Cut-off)
       - อ้างอิงจากสถิติ Transposition/Digit Shift ที่ให้ไป

    3. **คำแนะนำเชิงกลยุทธ์ (Process Recommendations):**
       - แนะนำวิธีแก้ไขกระบวนการทำงานเพื่อลดข้อผิดพลาดในระยะยาว (เช่น การใช้ Barcode Scanner, การ Double Check ยอดที่เกิน xxx บาท, การปรับเวลาปิดรอบ)

    4. **สิ่งที่ AI เรียนรู้ (AI Learning Summary):**
       - สรุปแพทเทิร์นที่ AI จับได้ในรอบนี้ เพื่อแจ้งให้ผู้ใช้ทราบว่ารอบหน้าจะจับคู่ได้แม่นยำขึ้นอย่างไร
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7, // Slightly creative for reporting
      }
    });

    return response.text || "ไม่สามารถสร้างรายงานได้";
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "เกิดข้อผิดพลาดในการสร้างรายงาน";
  }
};
