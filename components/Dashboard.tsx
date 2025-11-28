import React from 'react';
import { SummaryStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';

interface DashboardProps {
  stats: SummaryStats;
}

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const data = [
    { name: 'Matched', value: stats.matchedCount },
    { name: 'Unmatched Bank', value: stats.unmatchedBankCount },
    { name: 'Unmatched Book', value: stats.unmatchedBookCount },
  ];

  const formatCurrency = (val: number) => val.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Stat Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
        <FileText className="text-blue-500 w-8 h-8 mb-2" />
        <h3 className="text-slate-500 text-sm font-medium">รายการทั้งหมด</h3>
        <p className="text-2xl font-bold text-slate-800">{stats.totalBank + stats.totalBook}</p>
        <p className="text-xs text-slate-400 mt-1">Bank: {stats.totalBank} | Book: {stats.totalBook}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
        <CheckCircle className="text-emerald-500 w-8 h-8 mb-2" />
        <h3 className="text-slate-500 text-sm font-medium">จับคู่สำเร็จ</h3>
        <p className="text-2xl font-bold text-emerald-600">{stats.matchedCount}</p>
        <p className="text-xs text-emerald-400 mt-1">Exact & Fuzzy Match</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
        <XCircle className="text-red-500 w-8 h-8 mb-2" />
        <h3 className="text-slate-500 text-sm font-medium">ไม่ตรงกัน</h3>
        <p className="text-2xl font-bold text-red-600">{stats.unmatchedBankCount + stats.unmatchedBookCount}</p>
        <p className="text-xs text-red-400 mt-1">Bank: {stats.unmatchedBankCount} | Book: {stats.unmatchedBookCount}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
        <AlertTriangle className="text-amber-500 w-8 h-8 mb-2" />
        <h3 className="text-slate-500 text-sm font-medium">ผลต่างยอดเงิน</h3>
        <p className={`text-xl font-bold ${stats.diffAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {formatCurrency(stats.diffAmount)}
        </p>
        <p className="text-xs text-slate-400 mt-1">Bank Total - Book Total</p>
      </div>

      {/* Chart Section - Spanning full width on mobile, 2 cols on desktop */}
      <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">สัดส่วนผลการกระทบยอด</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
