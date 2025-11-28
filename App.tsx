import React, { useState } from 'react';
import { parseBankCSV, parseBookCSV } from './services/csvParser';
import { reconcileData } from './services/matcher';
import { analyzeDiscrepancies, generateExecutiveReport } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { ReconciliationTable } from './components/ReconciliationTable';
import { ReportView } from './components/ReportView';
import { SAMPLE_BANK_CSV, SAMPLE_BOOK_CSV } from './sampleData';
import { ReconciliationResult, SummaryStats } from './types';
import { Upload, Play, Sparkles, RefreshCw, BarChart3, Database, FileText } from 'lucide-react';

export default function App() {
  const [bankFileContent, setBankFileContent] = useState<string>('');
  const [bookFileContent, setBookFileContent] = useState<string>('');
  const [results, setResults] = useState<ReconciliationResult[]>([]);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  
  // Analysis States
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  
  // Report States
  const [executiveReport, setExecutiveReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'upload' | 'results' | 'report'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bank' | 'book') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (type === 'bank') setBankFileContent(content);
      else setBookFileContent(content);
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    setBankFileContent(SAMPLE_BANK_CSV);
    setBookFileContent(SAMPLE_BOOK_CSV);
    // Auto process after loading
    setTimeout(() => {
        const bankData = parseBankCSV(SAMPLE_BANK_CSV);
        const bookData = parseBookCSV(SAMPLE_BOOK_CSV);
        const { results, stats } = reconcileData(bankData, bookData);
        setResults(results);
        setStats(stats);
        setActiveTab('results');
    }, 100);
  };

  const handleProcess = () => {
    if (!bankFileContent || !bookFileContent) return;
    
    const bankData = parseBankCSV(bankFileContent);
    const bookData = parseBookCSV(bookFileContent);
    const { results, stats } = reconcileData(bankData, bookData);
    
    setResults(results);
    setStats(stats);
    setActiveTab('results');
    setAiAnalysis('');
    setExecutiveReport('');
  };

  const handleAnalyzeAI = async () => {
    setLoadingAI(true);
    const analysis = await analyzeDiscrepancies(results);
    setAiAnalysis(analysis);
    setLoadingAI(false);
  };

  const handleGenerateReport = async () => {
    if (!stats) return;
    setLoadingReport(true);
    const report = await generateExecutiveReport(results, stats);
    setExecutiveReport(report);
    setLoadingReport(false);
  };

  return (
    <div className="min-h-screen font-sans pb-12 selection:bg-purple-200">
      {/* Header */}
      <header className="glass-header sticky top-0 z-30">
        <div className="container mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                AutoReconcile AI
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Intelligent Financial Matching</p>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-400 hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Powered by Gemini 2.0 Flash
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Navigation Tabs */}
        {results.length > 0 && (
          <div className="flex justify-center mb-10">
            <div className="glass-panel p-1.5 rounded-full inline-flex gap-1">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'upload' 
                  ? 'bg-slate-100 text-slate-800 shadow-inner' 
                  : 'text-slate-500 hover:text-violet-600 hover:bg-slate-50'
                }`}
              >
                <Upload size={16} /> <span className="hidden sm:inline">อัปโหลด</span>
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'results' 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-slate-500 hover:text-violet-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 size={16} /> ผลลัพธ์
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'report' 
                  ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-pink-500/30' 
                  : 'text-slate-500 hover:text-fuchsia-600 hover:bg-slate-50'
                }`}
              >
                <FileText size={16} /> รายงานสรุป
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className={`${activeTab === 'upload' ? 'block' : 'hidden'} animate-fade-in`}>
          <div className="max-w-2xl mx-auto">
            <div className="glass-panel rounded-3xl p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 mb-4">
                  <Upload size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">เริ่มต้นการตรวจสอบ</h2>
                <p className="text-slate-500">อัปโหลดไฟล์ CSV จากธนาคารและระบบบัญชี เพื่อให้ AI ช่วยกระทบยอด</p>
              </div>

              <div className="space-y-6">
                {/* Bank CSV Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs">1</span>
                    ข้อมูล Bank Statement (CSV)
                  </label>
                  <div className="relative group transition-all duration-300 hover:-translate-y-1">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'bank')}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-2xl p-8 text-center bg-white/50 transition-colors"
                    />
                    {bankFileContent && (
                      <div className="absolute top-3 right-3 text-emerald-600 flex items-center gap-1 text-xs font-bold bg-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                        <FileText size={12} /> Ready
                      </div>
                    )}
                  </div>
                </div>

                {/* Book CSV Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center text-xs">2</span>
                     ข้อมูล Book / GL (CSV)
                  </label>
                  <div className="relative group transition-all duration-300 hover:-translate-y-1">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'book')}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-100 cursor-pointer border-2 border-dashed border-fuchsia-200 hover:border-fuchsia-400 rounded-2xl p-8 text-center bg-white/50 transition-colors"
                    />
                    {bookFileContent && (
                      <div className="absolute top-3 right-3 text-emerald-600 flex items-center gap-1 text-xs font-bold bg-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                        <FileText size={12} /> Ready
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={handleProcess}
                    disabled={!bankFileContent || !bookFileContent}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold shadow-xl shadow-purple-200 hover:shadow-purple-300 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                  >
                    <Play size={20} fill="currentColor" /> ประมวลผลข้อมูล
                  </button>
                  <button
                    onClick={loadSampleData}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-violet-200 text-slate-600 hover:text-violet-700 py-4 px-6 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-base"
                  >
                    <RefreshCw size={20} /> ใช้ข้อมูลตัวอย่าง
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Tab */}
        {results.length > 0 && activeTab === 'results' && (
          <div className="space-y-8 animate-fade-in">
            {stats && <Dashboard stats={stats} />}

            {/* Quick Analysis Widget */}
            {(stats?.unmatchedBankCount ?? 0) + (stats?.unmatchedBookCount ?? 0) > 0 && (
              <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-3xl shadow-xl shadow-purple-200 p-8 text-white relative overflow-hidden group">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-400 opacity-20 rounded-full -ml-20 -mb-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Sparkles className="text-yellow-300" size={24} />
                      </div>
                      AI Quick Insight
                    </h2>
                    <p className="text-purple-100 mt-2 font-medium opacity-90">วิเคราะห์สาเหตุเบื้องต้นด้วย AI (หากต้องการรายงานฉบับเต็ม ให้ไปที่แท็บ 'รายงานสรุป')</p>
                  </div>
                  {!aiAnalysis && !loadingAI && (
                    <button 
                      onClick={handleAnalyzeAI}
                      className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 group/btn"
                    >
                      <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" /> วิเคราะห์ด่วน
                    </button>
                  )}
                </div>

                {loadingAI && (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col items-center justify-center text-purple-100">
                    <RefreshCw className="animate-spin mb-3 w-8 h-8 opacity-80" />
                    <p className="animate-pulse">Gemini กำลังวิเคราะห์ข้อมูล...</p>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white leading-relaxed text-base shadow-inner">
                    {aiAnalysis.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0 opacity-90">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-8 w-1 bg-violet-500 rounded-full"></div>
                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Database size={24} className="text-violet-500" /> รายการตรวจสอบ
                 </h2>
              </div>
              <ReconciliationTable data={results} />
            </div>
          </div>
        )}

        {/* Report Tab */}
        {results.length > 0 && activeTab === 'report' && (
            <ReportView 
                reportContent={executiveReport} 
                isLoading={loadingReport} 
                onGenerate={handleGenerateReport} 
            />
        )}
      </main>
    </div>
  );
}