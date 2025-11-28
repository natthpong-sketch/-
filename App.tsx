import React, { useState } from 'react';
import { parseBankCSV, parseBookCSV } from './services/csvParser';
import { reconcileData } from './services/matcher';
import { analyzeDiscrepancies, generateExecutiveReport } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { ReconciliationTable } from './components/ReconciliationTable';
import { ReportView } from './components/ReportView';
import { SAMPLE_BANK_CSV, SAMPLE_BOOK_CSV } from './sampleData';
import { ReconciliationResult, SummaryStats } from './types';
import { Upload, Play, Sparkles, RefreshCw, BarChart3, Database, FileText, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AutoReconcile AI
            </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Google Gemini 2.0 Flash
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Navigation Tabs */}
        {results.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'upload' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload size={16} /> <span className="hidden sm:inline">อัปโหลด</span>
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'results' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart3 size={16} /> ผลลัพธ์
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'report' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">เริ่มต้นใช้งาน</h2>
                <p className="text-slate-500">อัปโหลดไฟล์ CSV จากธนาคารและระบบบัญชีเพื่อเริ่มการตรวจสอบ</p>
              </div>

              <div className="space-y-6">
                {/* Bank CSV Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Database className="text-blue-500" size={16} /> ข้อมูล Bank Statement (CSV)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'bank')}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-dashed border-slate-300 rounded-xl p-8 text-center"
                    />
                    {bankFileContent && (
                      <div className="absolute top-2 right-2 text-emerald-500 flex items-center gap-1 text-xs bg-emerald-50 px-2 py-1 rounded-md">
                        <FileText size={12} /> Loaded
                      </div>
                    )}
                  </div>
                </div>

                {/* Book CSV Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                     <FileText className="text-indigo-500" size={16} /> ข้อมูล Book / GL (CSV)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'book')}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-dashed border-slate-300 rounded-xl p-8 text-center"
                    />
                    {bookFileContent && (
                      <div className="absolute top-2 right-2 text-emerald-500 flex items-center gap-1 text-xs bg-emerald-50 px-2 py-1 rounded-md">
                        <FileText size={12} /> Loaded
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleProcess}
                    disabled={!bankFileContent || !bookFileContent}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={18} /> ประมวลผลข้อมูล
                  </button>
                  <button
                    onClick={loadSampleData}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} /> ใช้ข้อมูลตัวอย่าง
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
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="text-yellow-300" /> AI Quick Insight
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1">วิเคราะห์สาเหตุเบื้องต้น (หากต้องการรายงานฉบับเต็ม ให้ไปที่แท็บ 'รายงานสรุป')</p>
                  </div>
                  {!aiAnalysis && !loadingAI && (
                    <button 
                      onClick={handleAnalyzeAI}
                      className="bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg flex items-center gap-2"
                    >
                      <Sparkles size={16} /> วิเคราะห์ด่วน
                    </button>
                  )}
                </div>

                {loadingAI && (
                  <div className="flex flex-col items-center justify-center py-8 text-indigo-100">
                    <RefreshCw className="animate-spin mb-3 w-8 h-8" />
                    <p>กำลังวิเคราะห์ข้อมูล... กรุณารอสักครู่</p>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-indigo-50 leading-relaxed text-sm md:text-base">
                    {aiAnalysis.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Database size={20} className="text-slate-400" /> รายการตรวจสอบ
              </h2>
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