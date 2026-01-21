
import React, { useState, useEffect } from 'react';
import { Bill, Expense, Vehicle, AppSettings } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { TrendingUp, AlertCircle, Clock, Truck, BarChart3, PieChart, Info, CheckCircle2, IndianRupee, ShieldCheck } from 'lucide-react';

interface Props {
  settings: AppSettings;
}

const Reports: React.FC<Props> = ({ settings }) => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRev: 0,
    totalDue: 0,
    totalExp: 0,
    netProfit: 0
  });

  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';

  useEffect(() => {
    const bills: Bill[] = JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]');
    const vehicles: Vehicle[] = JSON.parse(localStorage.getItem(`${userPrefix}vehicles`) || '[]');
    const expenses: Expense[] = JSON.parse(localStorage.getItem(`${userPrefix}expenses`) || '[]');

    const totalRev = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalDue = bills.reduce((sum, b) => sum + b.dueAmount, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);

    setStats({
      totalRev,
      totalDue,
      totalExp,
      netProfit: totalRev - totalExp
    });

    const data = vehicles.map(v => {
      const vSessions = bills.flatMap(b => b.sessions).filter(s => s.machineId === v.id);
      const totalAmount = vSessions.reduce((sum, s) => sum + s.totalAmount, 0);
      
      const totalMinutes = vSessions.reduce((sum, s) => {
        const [h, m] = s.workTime.split(':').map(Number);
        return sum + (h * 60) + (m || 0);
      }, 0);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const formattedTime = `${hours}h ${mins}m`;

      const vehicleSpecificDue = bills
        .filter(b => b.sessions.some(s => s.machineId === v.id))
        .reduce((sum, b) => sum + b.dueAmount, 0);

      return {
        id: v.id,
        name: v.name,
        type: v.type,
        number: v.number,
        revenue: totalAmount,
        due: vehicleSpecificDue,
        totalHours: hours + (mins / 60),
        formattedTime: formattedTime
      };
    });

    setReportData(data);
  }, [userPrefix]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-10 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-none">Operational Analytics</h2>
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/60 font-black uppercase tracking-[0.2em] mt-2">Performance & Financial Audits</p>
        </div>
        <div className="bg-white dark:bg-[#121a16] px-4 py-2 rounded-2xl border border-gray-100 dark:border-emerald-900/20 shadow-sm flex items-center space-x-2">
          <Info size={14} className="text-emerald-500" />
          <span className="text-[9px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest">Real-time Financial Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#121a16] p-6 rounded-[2rem] border border-gray-50 dark:border-emerald-900/20 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform"><TrendingUp size={100} /></div>
          <TrendingUp className="text-emerald-500 mb-4" size={24} />
          <p className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest">Gross Revenue</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹{stats.totalRev.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#121a16] p-6 rounded-[2rem] border border-gray-50 dark:border-emerald-900/20 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform"><AlertCircle size={100} /></div>
          <AlertCircle className="text-red-500 mb-4" size={24} />
          <p className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest">Outstanding Collection</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">₹{stats.totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#121a16] p-6 rounded-[2rem] border border-gray-50 dark:border-emerald-900/20 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Clock size={100} /></div>
          <Clock className="text-orange-500 mb-4" size={24} />
          <p className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest">Operational Overhead</p>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tight">₹{stats.totalExp.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-900 dark:bg-emerald-950 p-6 rounded-[2rem] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><PieChart size={100} /></div>
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Net Business Profit</div>
          <p className="text-3xl font-black tracking-tight">₹{stats.netProfit.toLocaleString()}</p>
          <div className="mt-4 flex items-center space-x-2 opacity-50">
            <CheckCircle2 size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Calculated P&L Verified</span>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-[#121a16] rounded-[3rem] shadow-2xl border border-gray-50 dark:border-emerald-900/20 overflow-hidden">
        <div className="px-10 py-8 border-b dark:border-emerald-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/50 dark:bg-emerald-900/5">
           <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Truck size={24} />
             </div>
             <div>
               <h3 className="font-black text-gray-900 dark:text-emerald-100 uppercase text-sm tracking-widest">Vehicle Performance Ledger</h3>
               <p className="text-[9px] font-bold text-gray-400 dark:text-emerald-500/40 uppercase tracking-[0.2em] mt-1">Detailed Asset Yield & Analysis</p>
             </div>
           </div>
           <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-white dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck size={14} />
              <span>Audited for: {settings.companyName || 'Not Configured'}</span>
           </div>
        </div>

        <div className="p-8">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest border-b dark:border-emerald-900/20">
                  <th className="px-8 py-5">Vehicle Name & Identity</th>
                  <th className="px-8 py-5 text-center">Total Working Hours</th>
                  <th className="px-8 py-5 text-right">Gross Revenue Generated</th>
                  <th className="px-8 py-5 text-right">Balance Due / Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-emerald-900/10">
                {reportData.map((d, i) => (
                  <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-gray-100 dark:border-emerald-900/20 group-hover:scale-110 transition-transform">
                          <Truck size={20} />
                        </div>
                        <div>
                          <div className="font-black text-gray-900 dark:text-gray-100 text-sm tracking-tight uppercase">{d.name}</div>
                          <div className="text-[9px] font-bold text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest">{d.type} • {d.number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center space-x-2 text-xs font-black text-gray-600 dark:text-emerald-200/60">
                        <Clock size={14} className="text-emerald-500" />
                        <span className="tracking-widest uppercase">{d.formattedTime}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <IndianRupee size={12} className="text-emerald-500/50" />
                        <span className="font-black text-emerald-800 dark:text-emerald-400 text-base">{d.revenue.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className={`flex items-center justify-end space-x-1.5 font-black text-base ${d.due > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-500/30'}`}>
                        {d.due > 0 && <AlertCircle size={12} className="text-orange-500" />}
                        <span>₹{d.due.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="bg-emerald-950 p-12 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
         <div className="space-y-2">
            <h4 className="text-2xl font-black uppercase tracking-tighter">{settings.companyName || 'Enterprise Profile'}</h4>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em]">Official Performance Audit Ledger</p>
         </div>
         <div className="flex flex-col items-center md:items-end">
            <div className="w-48 h-px bg-emerald-800 mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/50">Owner: {settings.ownerName || 'Not Configured'}</p>
         </div>
      </div>
    </div>
  );
};

export default Reports;
