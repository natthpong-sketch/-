import React from 'react';
import { FileText, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming we can use simple rendering or just simple text mapping
// Since we don't have react-markdown in importmap, we'll implement a simple parser

interface Props {
  reportContent: string;
  isLoading: boolean;
  onGenerate: () => void;
}

// Simple Markdown-ish parser for demo purposes (headers and lists)
const SimpleMarkdownDisplay: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed">
      {content.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return <h3 key={idx} className="text-lg font-bold text-slate-800 mt-6 mb-2">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) { // Simple bold header
           return <h4 key={idx} className="font-bold text-slate-800 mt-4">{trimmed.replace(/\*\*/g, '')}</h4>; 
        }
        if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
            // Main Numbered Headers in our prompt
            return (
                <div key={idx} className="flex items-center gap-2 mt-6 mb-3 pb-2 border-b border-slate-100">
                    <div className="bg-blue-100 text-blue-700 p-1.5 rounded-md">
                        {trimmed.includes('บทสรุป') && <FileText size={18} />}
                        {trimmed.includes('วิเคราะห์') && <TrendingUp size={18} />}
                        {trimmed.includes('คำแนะนำ') && <Lightbulb size={18} />}
                        {trimmed.includes('AI') && <CheckCircle2 size={18} />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{trimmed.substring(3).replace(/\*\*/g, '')}</h3>
                </div>
            )
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-2 ml-4 mb-1">
              <span className="text-blue-500 mt-1.5">•</span>
              <p className={trimmed.includes('Transposition') || trimmed.includes('Digit Shift') ? 'font-medium text-slate-900' : ''}>
                  {trimmed.replace('- ', '').replace(/\*\*/g, '')}
              </p>
            </div>
          );
        }
        if (trimmed === '') return <br key={idx} />;
        
        return <p key={idx} className="mb-2">{trimmed.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
};

export const ReportView: React.FC<Props> = ({ reportContent, isLoading, onGenerate }) => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <FileText className="text-blue-400" />
                    รายงานสรุปผลผู้บริหาร
                </h2>
                <p className="text-slate-400 mt-2 text-sm">Executive Reconciliation Summary & Process Analysis</p>
            </div>
            {!isLoading && (
                <button 
                    onClick={onGenerate}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2"
                >
                    {reportContent ? 'สร้างรายงานใหม่' : 'สร้างรายงาน'}
                </button>
            )}
        </div>

        {/* Report Content */}
        <div className="p-8 min-h-[400px]">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-600 font-medium">กำลังวิเคราะห์ข้อมูลเชิงลึก...</p>
                        <p className="text-xs mt-1">AI กำลังประมวลผลรูปแบบข้อผิดพลาดและสร้างคำแนะนำ</p>
                    </div>
                </div>
            ) : reportContent ? (
                <div className="bg-slate-50 rounded-xl p-8 border border-slate-100 shadow-inner">
                    <SimpleMarkdownDisplay content={reportContent} />
                    
                    <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-xs">
                        รายงานนี้สร้างโดย AutoReconcile AI • ข้อมูลสำหรับการตัดสินใจภายในเท่านั้น
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <FileText size={64} className="mb-4 opacity-20" />
                    <p>กดปุ่ม "สร้างรายงาน" เพื่อให้ AI วิเคราะห์ภาพรวมและเสนอแนะแนวทางแก้ไข</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
