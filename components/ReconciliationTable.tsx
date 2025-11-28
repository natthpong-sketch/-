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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'MATCHED', label: 'จับคู่แล้ว' },
            { id: 'POTENTIAL', label: 'รอตรวจสอบ/แก้ไข' },
            { id: 'UNMATCHED', label: 'ไม่ตรงกัน' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="ค้นหา Invoice, ยอดเงิน..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-3 text-center w-[120px]">สถานะ</th>
              <th className="px-4 py-3 bg-blue-50/50 text-blue-800 border-r border-slate-200 w-1/3 min-w-[250px]">
                ข้อมูล Bank Statement (ถูกต้อง)
              </th>
              <th className="px-4 py-3 bg-indigo-50/50 text-indigo-800 w-1/3 min-w-[250px]">
                ข้อมูล Book (GL)
              </th>
              <th className="px-4 py-3 min-w-[250px]">การวิเคราะห์ & Smart Fix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                    ${item.status === MatchStatus.MATCHED ? 'bg-emerald-100 text-emerald-700' :
                      item.status === MatchStatus.POTENTIAL_MATCH ? 'bg-amber-100 text-amber-700' :
                      item.status === MatchStatus.UNMATCHED_BANK ? 'bg-blue-100 text-blue-700' :
                      'bg-indigo-100 text-indigo-700'
                    }
                  `}>
                    {item.status === MatchStatus.MATCHED && 'Matched'}
                    {item.status === MatchStatus.POTENTIAL_MATCH && 'Review'}
                    {item.status === MatchStatus.UNMATCHED_BANK && 'Bank Only'}
                    {item.status === MatchStatus.UNMATCHED_BOOK && 'Book Only'}
                  </span>
                </td>

                {/* Bank Column */}
                <td className={`px-4 py-3 border-r border-slate-200 align-top ${!item.bankRecord ? 'bg-slate-50/50' : ''}`}>
                  {item.bankRecord ? (
                    <div className="space-y-1">
                      <div className="flex justify-between font-medium text-slate-900">
                        <span>{item.bankRecord.transaction_date}</span>
                        <span>{formatCurrency(item.bankRecord.total_amount)}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-col gap-0.5">
                         <span>Inv: <span className="font-medium text-slate-700">{item.bankRecord.invoice_number}</span></span>
                         <span>{item.bankRecord.fuel_brand} ({item.bankRecord.product})</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-xs flex items-center gap-1 mt-1">
                      <ArrowRight className="w-3 h-3" /> ไม่มีข้อมูล
                    </div>
                  )}
                </td>

                {/* Book Column */}
                <td className={`px-4 py-3 align-top ${!item.bookRecord ? 'bg-slate-50/50' : ''}`}>
                  {item.bookRecord ? (
                    <div className="space-y-1">
                      <div className="flex justify-between font-medium text-slate-900">
                        <span>{item.bookRecord.posting_date}</span>
                        <span className={item.suggestedFix ? 'text-red-600 line-through decoration-red-400' : ''}>
                          {formatCurrency(item.bookRecord.amount)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-col gap-0.5">
                        <span>Doc: {item.bookRecord.document_no}</span>
                        <span>Desc: <span className="font-medium text-slate-700">{item.bookRecord.description}</span></span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-xs flex items-center gap-1 mt-1">
                       <ArrowLeft className="w-3 h-3" /> ไม่มีข้อมูล
                    </div>
                  )}
                </td>

                {/* Analysis & Smart Fix Column */}
                <td className="px-4 py-3 align-top">
                    {item.suggestedFix ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                        <div className="flex items-start gap-2 mb-1">
                          <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Smart Fix</p>
                            <p className="text-sm font-medium text-slate-800">{item.suggestedFix.description}</p>
                          </div>
                        </div>
                        <div className="ml-6 text-xs text-slate-600">
                          {item.suggestedFix.correction}
                        </div>
                        {item.suggestedFix.confidence === 'HIGH' && (
                           <div className="mt-2 ml-6 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                             ความเชื่อมั่นสูง
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 flex items-start gap-2">
                        {item.note && <AlertCircle className="w-3 h-3 mt-0.5" />}
                        {item.note || '-'}
                      </div>
                    )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  <span>ไม่พบรายการที่ค้นหา</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
        แสดงผล {filteredData.length} รายการ
      </div>
    </div>
  );
};