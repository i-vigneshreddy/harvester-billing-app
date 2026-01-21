
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, Wallet, AlertCircle, Smartphone, Download, Star, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { Bill, Expense } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDue: 0,
    activeSessions: 0,
    totalExpenses: 0,
    customerCount: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

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

    // Mock weekly trend data based on totals
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

  const generateAiInsight = async () => {
    if (!process.env.API_KEY) {
      setAiInsight("Gemini API Key missing. Please set API_KEY in your Netlify Environment Variables.");
      return;
    }

    if (isAiLoading) return;
    setIsAiLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a senior agricultural business consultant for a Harvester business owner. 
      Current Business Status: 
      - Total Revenue: ₹${stats.totalRevenue}
      - Total Expenses: ₹${stats.totalExpenses}
      - Total Due from Customers: ₹${stats.totalDue}
      - Active Sessions: ${stats.activeSessions}
      
      Based on this data, provide one professional, actionable business insight or financial tip to improve profit or collections. Keep it under 25 words. Be encouraging but direct.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiInsight(response.text || 'Focus on optimizing session schedules to maximize yield.');
    } catch (err) {
      console.error('AI Insight Error:', err);
      setAiInsight('Focus on collecting outstanding dues to maintain healthy operational cash flow.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (stats.totalRevenue > 0) {
      generateAiInsight();
    }
  }, [stats.totalRevenue]);

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
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/70 font-bold uppercase tracking-[0.2em] mt-1">Netlify Enterprise Deployment</p>
        </div>
      </div>

      {/* AI Smart Insight Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-0.5 rounded-[2.5rem] shadow-xl overflow-hidden group mx-2">
        <div className="bg-white dark:bg-[#121a16] p-6 rounded-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
           <div className="flex items-center space-x-6 w-full md:w-auto">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative shrink-0">
                 <Sparkles className={`transition-transform duration-700 ${isAiLoading ? 'animate-spin' : 'group-hover:scale-125'}`} size={32} />
                 {isAiLoading && <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-3xl animate-spin"></div>}
              </div>
              <div className="space-y-1 flex-1">
                 <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">Smart Business Analyst</h3>
                 <div className="min-h-[1.5rem]">
                    {isAiLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 w-full md:w-48 bg-gray-100 dark:bg-emerald-900/20 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <p className="text-sm font-black text-gray-800 dark:text-gray-100 leading-tight italic">
                        "{aiInsight || 'Setting up your intelligence suite... Enter data to start analysis.'}"
                      </p>
                    )}
                 </div>
              </div>
           </div>
           <button 
             onClick={generateAiInsight}
             disabled={isAiLoading}
             className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95 disabled:opacity-50"
           >
              <RefreshCw size={14} className={isAiLoading ? 'animate-spin' : ''} />
              <span>Refresh Insight</span>
           </button>
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
        <div className="lg:col-span-2 bg-white dark:bg-[#121a16] p-8 rounded-[3rem] border border-gray-100 dark:border-emerald-900/20 shadow-xl">
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

        {/* Play Store Promotion Card */}
        <div className="bg-emerald-900 dark:bg-emerald-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-110">
              <Smartphone size={150} />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="space-y-1">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Mobile Deployment</h3>
                 <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.3em]">Official Field App</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-3">
                 <div className="flex items-center space-x-2 text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-black text-white">4.9 User Rating</span>
                 </div>
                 <p className="text-[10px] font-bold text-emerald-100 leading-relaxed opacity-70">Download the companion mobile app for field billing and offline data persistence.</p>
              </div>

              <button 
                onClick={() => navigate('/playstore')}
                className="w-full flex items-center justify-center space-x-3 bg-white text-emerald-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <Download size={18} /> <span>Get on Play Store</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
