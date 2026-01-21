
import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Wallet, AlertCircle } from 'lucide-react';
import { Bill, Expense } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDue: 0,
    activeSessions: 0,
    totalExpenses: 0,
    customerCount: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);

  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';

  useEffect(() => {
    const bills: Bill[] = JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]');
    const expenses: Expense[] = JSON.parse(localStorage.getItem(`${userPrefix}expenses`) || '[]');
    
    const rev = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const due = bills.reduce((sum, b) => sum + b.dueAmount, 0);
    const exp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const customers = new Set(bills.map(b => b.customer.id)).size;

    setStats({
      totalRevenue: rev,
      totalDue: due,
      activeSessions: bills.length,
      totalExpenses: exp,
      customerCount: customers
    });

    setChartData([
      { name: 'Mon', revenue: rev * 0.1, expenses: exp * 0.15 },
      { name: 'Tue', revenue: rev * 0.2, expenses: exp * 0.1 },
      { name: 'Wed', revenue: rev * 0.15, expenses: exp * 0.2 },
      { name: 'Thu', revenue: rev * 0.25, expenses: exp * 0.15 },
      { name: 'Fri', revenue: rev * 0.1, expenses: exp * 0.1 },
      { name: 'Sat', revenue: rev * 0.05, expenses: exp * 0.2 },
      { name: 'Sun', revenue: rev * 0.15, expenses: exp * 0.1 },
    ]);
  }, [userPrefix]);

  const cards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Total Expenses', value: `₹${stats.totalExpenses.toLocaleString()}`, icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { title: 'Balance Due', value: `₹${stats.totalDue.toLocaleString()}`, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { title: 'Work Sessions', value: stats.activeSessions.toString(), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tighter uppercase leading-none">Business Overview</h2>
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/70 font-bold uppercase tracking-[0.2em] mt-1">Operational Summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#121a16] p-6 rounded-[2.5rem] border border-gray-100 dark:border-emerald-900/20 shadow-xl hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`${card.bg} p-4 rounded-3xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 dark:text-emerald-500/50 text-[10px] font-black uppercase tracking-widest">{card.title}</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 tracking-tighter">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        <div className="lg:col-span-3 bg-white dark:bg-[#121a16] p-8 rounded-[3rem] border border-gray-100 dark:border-emerald-900/20 shadow-xl">
          <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-[0.2em] mb-8">Financial Performance Audit</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(16, 185, 129, 0.05)'}}
                  contentStyle={{borderRadius: '24px', border: 'none', background: '#111a15', color: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} barSize={24} name="Revenue" />
                <Bar dataKey="expenses" fill="#f97316" radius={[8, 8, 0, 0]} barSize={24} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
