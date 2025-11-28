import React from 'react';
import { FileText, TrendingUp, Lightbulb, CheckCircle2 } from 'lucide-react';

interface Props {
  reportContent: string;
  isLoading: boolean;
  onGenerate: () => void;
}

// Simple Markdown-ish parser
const SimpleMarkdownDisplay: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed text-sm md:text-base">
      {content.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return <h3 key={idx} className="text-xl font-bold text-slate-800 mt-8 mb-3 flex items-center gap-2">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) { 
           return <h4 key={idx} className="font-bold text-violet-900 mt-4 mb-1">{trimmed.replace(/\*\*/g, '')}</h4>; 
        }
        if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
            // Main Numbered Headers
            const title = trimmed.substring(3).replace(/\*\*/g, '');
            return (
                <div key={idx} className="flex items-start gap-3 mt-8 mb-4 p-4 bg-white rounded-xl border border-purple-50 shadow-sm">
                    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white p-2.5 rounded-lg shadow-md mt-1">
                        {title.includes('บทสรุป') && <FileText size={20} />}
                        {title.includes('วิเคราะห์') && <TrendingUp size={20} />}
                        {title.includes('คำแนะนำ') && <Lightbulb size={20} />}
                        {title.includes('AI') && <CheckCircle2 size={20} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-semibold">Report Section 0{trimmed.charAt(0)}</p>
                    </div>
                </div>
            )
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-3 ml-2 mb-2 group">
              <span className="text-violet-400 mt-1.5 group-hover:text-violet-600 transition-colors">•</span>
              <p className={trimmed.includes('Transposition') || trimmed.includes('Digit Shift') ? 'font-semibold text-slate-800 bg-violet-50 px-2 rounded' : ''}>
                  {trimmed.replace('- ', '').replace(/\*\*/g, '')}
              </p>
            </div>
          );
        }
        if (trimmed === '') return <div key={idx} className="h-2"></div>;
        
        return <p key={idx} className="mb-2 text-slate-600">{trimmed.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
};

export const ReportView: React.FC<Props> = ({ reportContent, isLoading, onGenerate }) => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/10">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500 opacity-20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg">
                        <FileText className="text-fuchsia-300" size={20} />
                    </div>
                    <span className="text-fuchsia-200 text-sm font-bold tracking-widest uppercase">Executive Report</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                    รายงานสรุปผลผู้บริหาร
                </h2>
                <p className="text-slate-300 text-sm max-w-md">
                    วิเคราะห์สถานะการเงิน สรุปความเสี่ยง และข้อเสนอแนะเชิงกลยุทธ์โดย AI
                </p>
            </div>
            {!isLoading && (
                <button 
                    onClick={onGenerate}
                    className="mt-6 md:mt-0 relative z-10 bg-white text-violet-900 hover:bg-fuchsia-50 px-6 py-3 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2 group"
                >
                    {reportContent ? 'สร้างรายงานใหม่' : 'สร้างรายงาน AI'}
                    <Lightbulb size={18} className="group-hover:text-fuchsia-600 transition-colors" />
                </button>
            )}
        </div>

        {/* Report Content */}
        <div className="p-8 md:p-12 min-h-[500px] bg-white">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-6">
                    <div className="relative w-20 h-20">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-800 font-bold text-lg">กำลังวิเคราะห์ข้อมูลเชิงลึก...</p>
                        <p className="text-slate-400 text-sm mt-2">AI กำลังตรวจสอบ Pattern และเขียนคำแนะนำ</p>
                    </div>
                </div>
            ) : reportContent ? (
                <div className="animate-fade-in">
                    <SimpleMarkdownDisplay content={reportContent} />
                    
                    <div className="mt-16 pt-8 border-t border-slate-100 text-center flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                            <CheckCircle2 size={16} />
                        </div>
                        <p className="text-slate-400 text-xs font-medium">
                            รายงานนี้สร้างโดย AutoReconcile AI • ใช้สำหรับประกอบการตัดสินใจภายในเท่านั้น
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-80 text-center max-w-md mx-auto">
                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                        <FileText size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีรายงาน</h3>
                    <p className="text-slate-500 mb-8">กดปุ่ม "สร้างรายงาน AI" ด้านบน เพื่อให้ Gemini ช่วยสรุปผลการกระทบยอดและแนะนำแนวทางแก้ไขปัญหา</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};