import React, { useState } from 'react';
import { ReconciliationResult, MatchStatus } from '../types';
import { Search, ArrowRight, ArrowLeft, Lightbulb, AlertCircle } from 'lucide-react';

interface Props {
  data: ReconciliationResult[];
}

export const ReconciliationTable: React.FC<Props> = ({ data }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'MATCHED' ? (item.status === MatchStatus.MATCHED) :
      filter === 'POTENTIAL' ? (item.status === MatchStatus.POTENTIAL_MATCH) :
      filter === 'UNMATCHED' ? (item.status === MatchStatus.UNMATCHED_BANK || item.status === MatchStatus.UNMATCHED_BOOK) : true;

    const matchesSearch = 
      (item.bankRecord?.invoice_number || '').includes(searchTerm) || 
      (item.bookRecord?.description || '').includes(searchTerm) ||
      (item.bankRecord?.total_amount || 0).toString().includes(searchTerm) ||
      (item.bookRecord?.amount || 0).toString().includes(searchTerm) ||
      (item.suggestedFix?.description || '').includes(searchTerm) ||
      false;

    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (val?: number) => val !== undefined ? val.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-';

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-purple-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'MATCHED', label: 'จับคู่แล้ว' },
            { id: 'POTENTIAL', label: 'รอตรวจสอบ' },
            { id: 'UNMATCHED', label: 'ไม่ตรงกัน' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                filter === f.id 
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-violet-500 transition-colors" />
          <input 
            type="text" 
            placeholder="ค้นหา Invoice, ยอดเงิน..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 text-slate-600 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-5 py-4 text-center w-[120px] rounded-tl-xl">สถานะ</th>
              <th className="px-5 py-4 bg-violet-50/50 text-violet-900 border-r border-violet-100 w-1/3 min-w-[250px]">
                Bank Statement <span className="text-[10px] text-violet-500 font-normal ml-1">(Master)</span>
              </th>
              <th className="px-5 py-4 bg-fuchsia-50/50 text-fuchsia-900 w-1/3 min-w-[250px]">
                Book / GL <span className="text-[10px] text-fuchsia-500 font-normal ml-1">(User)</span>
              </th>
              <th className="px-5 py-4 min-w-[250px] rounded-tr-xl">การวิเคราะห์ & Smart Fix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredData.length > 0 ? filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-violet-50/30 transition-colors group">
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-sm
                    ${item.status === MatchStatus.MATCHED ? 'bg-emerald-100 text-emerald-700' :
                      item.status === MatchStatus.POTENTIAL_MATCH ? 'bg-amber-100 text-amber-700' :
                      item.status === MatchStatus.UNMATCHED_BANK ? 'bg-violet-100 text-violet-700' :
                      'bg-fuchsia-100 text-fuchsia-700'
                    }
                  `}>
                    {item.status === MatchStatus.MATCHED && 'Matched'}
                    {item.status === MatchStatus.POTENTIAL_MATCH && 'Review'}
                    {item.status === MatchStatus.UNMATCHED_BANK && 'Bank Only'}
                    {item.status === MatchStatus.UNMATCHED_BOOK && 'Book Only'}
                  </span>
                </td>

                {/* Bank Column */}
                <td className={`px-5 py-4 border-r border-slate-100 align-top ${!item.bankRecord ? 'bg-slate-50/30' : ''}`}>
                  {item.bankRecord ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline font-bold text-slate-800">
                        <span className="text-sm font-mono text-violet-700 bg-violet-50 px-1.5 rounded">{item.bankRecord.invoice_number}</span>
                        <span className="text-base">{formatCurrency(item.bankRecord.total_amount)}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-col gap-0.5 pl-1 border-l-2 border-violet-200">
                         <span className="pl-2">Date: {item.bankRecord.transaction_date}</span>
                         <span className="pl-2">{item.bankRecord.fuel_brand} ({item.bankRecord.product})</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-xs flex items-center gap-1 mt-1 opacity-60">
                      <ArrowRight className="w-3 h-3" /> ไม่มีข้อมูล
                    </div>
                  )}
                </td>

                {/* Book Column */}
                <td className={`px-5 py-4 align-top ${!item.bookRecord ? 'bg-slate-50/30' : ''}`}>
                  {item.bookRecord ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline font-bold text-slate-800">
                         <span className="text-sm font-mono text-fuchsia-700 bg-fuchsia-50 px-1.5 rounded">{item.bookRecord.description}</span>
                         <span className={item.suggestedFix ? 'text-rose-500 line-through decoration-rose-400 decoration-2' : ''}>
                          {formatCurrency(item.bookRecord.amount)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-col gap-0.5 pl-1 border-l-2 border-fuchsia-200">
                        <span className="pl-2">Date: {item.bookRecord.posting_date}</span>
                        <span className="pl-2">Doc: {item.bookRecord.document_no}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-xs flex items-center gap-1 mt-1 opacity-60">
                       <ArrowLeft className="w-3 h-3" /> ไม่มีข้อมูล
                    </div>
                  )}
                </td>

                {/* Analysis & Smart Fix Column */}
                <td className="px-5 py-4 align-top">
                    {item.suggestedFix ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-2 mb-1.5">
                          <div className="p-1 bg-amber-100 rounded-md">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest mb-0.5">Smart Fix AI</p>
                            <p className="text-sm font-bold text-slate-800">{item.suggestedFix.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 pl-8 mb-2 leading-relaxed">
                          {item.suggestedFix.correction}
                        </div>
                        {item.suggestedFix.confidence === 'HIGH' && (
                           <div className="ml-8 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                             High Confidence
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 flex items-start gap-2 mt-1">
                        {item.note && <AlertCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5" />}
                        {item.note || '-'}
                      </div>
                    )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-20 text-center text-slate-400 flex flex-col items-center justify-center bg-slate-50/50">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <span>ไม่พบรายการที่ค้นหา</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-white/50 border-t border-purple-50 text-xs text-slate-500 text-center font-medium">
        แสดงผล {filteredData.length} รายการ
      </div>
    </div>
  );
};