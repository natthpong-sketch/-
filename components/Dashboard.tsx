import React from 'react';
import { SummaryStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle, XCircle, AlertTriangle, FileText, Activity } from 'lucide-react';

interface DashboardProps {
  stats: SummaryStats;
}

// Modern Purple Theme Colors
const COLORS = ['#8B5CF6', '#F43F5E', '#F59E0B', '#A78BFA']; // Violet, Rose, Amber, Light Purple

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
      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <FileText size={64} className="text-violet-500" />
        </div>
        <div className="p-3 bg-violet-100 rounded-full mb-3 text-violet-600">
            <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">รายการทั้งหมด</h3>
        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalBank + stats.totalBook}</p>
        <p className="text-xs font-medium text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            Bank: {stats.totalBank} | Book: {stats.totalBook}
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="p-3 bg-emerald-100 rounded-full mb-3 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">จับคู่สำเร็จ</h3>
        <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.matchedCount}</p>
        <p className="text-xs font-medium text-emerald-500/70 mt-2">Exact & Fuzzy Match</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="p-3 bg-rose-100 rounded-full mb-3 text-rose-600">
            <XCircle className="w-6 h-6" />
        </div>
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">ไม่ตรงกัน</h3>
        <p className="text-3xl font-bold text-rose-600 mt-1">{stats.unmatchedBankCount + stats.unmatchedBookCount}</p>
        <p className="text-xs font-medium text-rose-400 mt-2 bg-rose-50 px-2 py-1 rounded-md">
            Check Required
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="p-3 bg-amber-100 rounded-full mb-3 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">ผลต่างยอดเงิน</h3>
        <p className={`text-2xl font-bold mt-1 ${stats.diffAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {formatCurrency(stats.diffAmount)}
        </p>
        <p className="text-xs font-medium text-slate-400 mt-2">Bank Total - Book Total</p>
      </div>

      {/* Chart Section */}
      <div className="md:col-span-4 glass-panel p-8 rounded-2xl mt-2">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full"></div>
            สัดส่วนผลการกระทบยอด
        </h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};