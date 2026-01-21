import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Contact, Phone, Save, TrendingUp, History, X, Calendar, Clock, BadgePercent, Briefcase, ShieldCheck, CheckCircle2, AlertCircle, RefreshCcw, IndianRupee } from 'lucide-react';
import { Agent, VehicleType, Bill, WorkingSession } from '../types';

interface CommissionRecord {
  billId: string;
  sessionId: string;
  customerName: string;
  date: string;
  vehicleType: string;
  hours: string;
  ratePerHour: number;
  sessionTotal: number;
  amount: number; // Commission amount
  isPaid: boolean;
}

const AgentsView: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [historyAgent, setHistoryAgent] = useState<{agent: Agent, records: CommissionRecord[]} | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';

  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: '',
    mobile: '',
    vehicleCommissions: {
      [VehicleType.TWO_WHEEL]: 50,
      [VehicleType.FOUR_WHEEL]: 100,
      [VehicleType.TRACK]: 150,
      [VehicleType.HARVESTER]: 200,
    }
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`${userPrefix}agents`) || '[]');
    setAgents(saved);
  }, [userPrefix]);

  const handleAdd = () => {
    if (!newAgent.name || !newAgent.mobile) {
      alert("Name and Mobile are required.");
      return;
    }
    const agent: Agent = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAgent.name!,
      mobile: newAgent.mobile!,
      vehicleCommissions: newAgent.vehicleCommissions as Record<VehicleType, number>
    };
    const updated = [...agents, agent];
    setAgents(updated);
    localStorage.setItem(`${userPrefix}agents`, JSON.stringify(updated));
    setNewAgent({ 
      name: '', 
      mobile: '', 
      vehicleCommissions: {
        [VehicleType.TWO_WHEEL]: 50,
        [VehicleType.FOUR_WHEEL]: 100,
        [VehicleType.TRACK]: 150,
        [VehicleType.HARVESTER]: 200,
      }
    });
    setShowForm(false);
  };

  const getAgentRecords = (agentId: string) => {
    const allBills: Bill[] = JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]');
    const records: CommissionRecord[] = [];
    const allVehicles = JSON.parse(localStorage.getItem(`${userPrefix}vehicles`) || '[]');

    allBills.forEach(bill => {
      bill.sessions.forEach(session => {
        if (session.agentId === agentId) {
          const vehicle = allVehicles.find((v: any) => v.id === session.machineId);
          records.push({
            billId: bill.id,
            sessionId: session.id,
            customerName: bill.customer.name,
            date: session.date,
            vehicleType: vehicle?.type || 'Unknown',
            hours: session.workTime,
            ratePerHour: session.standardRate,
            sessionTotal: session.totalAmount,
            amount: session.agentCommission || 0,
            isPaid: !!session.commissionPaid
          });
        }
      });
    });
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const viewHistory = (agent: Agent) => {
    const records = getAgentRecords(agent.id);
    setHistoryAgent({ agent, records });
    setStatusFilter('all');
  };

  const toggleCommissionStatus = (billId: string, sessionId: string) => {
    const allBills: Bill[] = JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]');
    let updated = false;

    const newBills = allBills.map(bill => {
      if (bill.id === billId) {
        const newSessions = bill.sessions.map(session => {
          if (session.id === sessionId) {
            updated = true;
            return { ...session, commissionPaid: !session.commissionPaid };
          }
          return session;
        });
        return { ...bill, sessions: newSessions };
      }
      return bill;
    });

    if (updated) {
      localStorage.setItem(`${userPrefix}bills`, JSON.stringify(newBills));
      if (historyAgent) {
        const newRecords = getAgentRecords(historyAgent.agent.id);
        setHistoryAgent({ ...historyAgent, records: newRecords });
      }
    }
  };

  const updateCommission = (type: VehicleType, amount: number) => {
    setNewAgent({
      ...newAgent,
      vehicleCommissions: {
        ...newAgent.vehicleCommissions as Record<VehicleType, number>,
        [type]: amount
      }
    });
  };

  const removeAgent = (id: string) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      const updated = agents.filter(a => a.id !== id);
      setAgents(updated);
      localStorage.setItem(`${userPrefix}agents`, JSON.stringify(updated));
      
      // Clear form after deletion
      setNewAgent({ 
        name: '', 
        mobile: '', 
        vehicleCommissions: {
          [VehicleType.TWO_WHEEL]: 50,
          [VehicleType.FOUR_WHEEL]: 100,
          [VehicleType.TRACK]: 150,
          [VehicleType.HARVESTER]: 200,
        }
      });
      setShowForm(false);
      if (historyAgent?.agent.id === id) {
        setHistoryAgent(null);
      }
    }
  };

  const filteredRecords = historyAgent?.records.filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return r.isPaid;
    if (statusFilter === 'pending') return !r.isPaid;
    return true;
  }) || [];

  const pendingCount = historyAgent?.records.filter(r => !r.isPaid).length || 0;
  const paidCount = historyAgent?.records.filter(r => r.isPaid).length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Agents & Brokers</h2>
          <p className="text-sm text-gray-500 dark:text-emerald-500/50 font-medium">Manage referral commissions and view earning history.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-2.5 rounded-xl flex items-center font-bold transition-all shadow-md ${showForm ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {showForm ? 'Cancel' : <><Plus size={18} className="mr-2" /> Register Agent</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#121a16] p-8 rounded-3xl shadow-xl border border-emerald-50 dark:border-emerald-900/20 animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3 mb-8">
            <Contact size={20} className="text-emerald-600" />
            <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Agent Registration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" placeholder="Agent Name" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-50 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Mobile No</label>
              <input type="tel" placeholder="10 Digit Number" value={newAgent.mobile} onChange={e => setNewAgent({...newAgent, mobile: e.target.value})} className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-50 transition-all" />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Default Commission Rates (₹ per hour)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(VehicleType).map(type => (
                <div key={type} className="bg-gray-50/30 dark:bg-emerald-900/10 p-4 rounded-2xl border border-gray-100 dark:border-emerald-900/20">
                  <label className="block text-[9px] font-black text-gray-400 dark:text-emerald-500/30 uppercase mb-2">{type}</label>
                  <input 
                    type="number" 
                    value={newAgent.vehicleCommissions?.[type] || 0} 
                    onChange={e => updateCommission(type, Number(e.target.value))}
                    className="w-full bg-transparent font-black text-gray-800 dark:text-emerald-100 outline-none border-b border-gray-200 dark:border-emerald-900/30 focus:border-emerald-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="w-full bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:bg-emerald-700 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3"
          >
            <Save size={18} />
            <span>Finalize Agent Registry</span>
          </button>
        </div>
      )}

      {/* Agents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const records = getAgentRecords(agent.id);
          const totalEarned = records.reduce((sum, r) => sum + r.amount, 0);
          const pendingPay = records.filter(r => !r.isPaid).reduce((sum, r) => sum + r.amount, 0);
          
          return (
            <div key={agent.id} className="bg-white dark:bg-[#121a16] p-6 rounded-[2.5rem] border border-gray-100 dark:border-emerald-900/20 shadow-sm hover:shadow-xl transition-all relative group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg border border-emerald-200 dark:border-emerald-800/50 shadow-inner">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg tracking-tight leading-none">{agent.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest mt-2 flex items-center">
                      <Phone size={10} className="mr-1 text-emerald-500" /> {agent.mobile}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => removeAgent(agent.id)} 
                  className="p-2 text-gray-300 dark:text-emerald-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-gray-50 dark:bg-emerald-950/30 rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-gray-50/50 dark:bg-emerald-900/10 rounded-2xl border border-gray-100 dark:border-emerald-900/10">
                  <span className="text-[9px] font-black text-gray-400 dark:text-emerald-500/30 uppercase tracking-widest block mb-1">Total Earned</span>
                  <span className="text-sm font-black text-gray-900 dark:text-gray-100">₹{totalEarned.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                  <span className="text-[9px] font-black text-orange-400 dark:text-orange-500/50 uppercase tracking-widest block mb-1">Unpaid Balance</span>
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400">₹{pendingPay.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => viewHistory(agent)}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-white dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all shadow-sm active:scale-95"
              >
                <History size={14} /> <span>View Earnings Ledger</span>
              </button>
            </div>
          );
        })}
        {agents.length === 0 && !showForm && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 dark:border-emerald-900/10 rounded-[3rem] bg-white dark:bg-[#121a16] shadow-sm">
             <Contact size={48} className="mx-auto mb-4 opacity-10 text-emerald-600" />
             <p className="font-bold uppercase tracking-widest text-xs text-gray-400 dark:text-emerald-500/30">No broker records found in system</p>
          </div>
        )}
      </div>

      {/* History Ledger View */}
      {historyAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0f0d] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in">
            <div className="p-8 border-b dark:border-emerald-900/20 flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white dark:bg-[#121a16] rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-none">{historyAgent.agent.name}</h3>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest mt-1">Commission Settlement Ledger</p>
                </div>
              </div>
              <button onClick={() => setHistoryAgent(null)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <div className="p-8 bg-gray-50/50 dark:bg-emerald-900/5 border-b dark:border-emerald-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
               <div className="flex items-center space-x-2 bg-white dark:bg-[#1a2e26] p-1.5 rounded-2xl border border-gray-100 dark:border-emerald-900/20 shadow-sm">
                 <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 dark:text-emerald-500/30 hover:text-emerald-600'}`}>Everything</button>
                 <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 dark:text-emerald-500/30 hover:text-orange-500'}`}>Unpaid ({pendingCount})</button>
                 <button onClick={() => setStatusFilter('paid')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 dark:text-emerald-500/30 hover:text-emerald-600'}`}>Settled ({paidCount})</button>
               </div>
               <div className="flex items-center space-x-6 text-right">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 dark:text-emerald-500/30 uppercase tracking-[0.2em] block mb-1">Total Pending</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 leading-none">₹{historyAgent.records.filter(r => !r.isPaid).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              <div className="space-y-4">
                {filteredRecords.map((record, i) => (
                  <div key={i} className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row justify-between items-center gap-6 group hover:shadow-lg ${record.isPaid ? 'bg-white dark:bg-[#121a16] border-gray-100 dark:border-emerald-900/10' : 'bg-orange-50/20 dark:bg-orange-950/5 border-orange-100 dark:border-orange-900/20'}`}>
                    <div className="flex items-center space-x-5 flex-1">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${record.isPaid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'}`}>
                          {record.isPaid ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                       </div>
                       <div>
                          <div className="flex items-center space-x-2">
                             <span className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{record.customerName}</span>
                             <span className="text-[10px] text-gray-400 dark:text-emerald-500/30 font-bold">• {record.billId}</span>
                          </div>
                          <div className="flex items-center space-x-3 mt-1.5 text-[10px] font-bold text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest">
                             <Calendar size={12} className="text-emerald-500/50" /> <span>{record.date}</span>
                             <Clock size={12} className="text-emerald-500/50" /> <span>{record.hours} @ ₹{record.ratePerHour}/hr</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center space-x-8">
                       <div className="text-right">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">Commission</span>
                          <span className="text-lg font-black text-gray-900 dark:text-gray-100">₹{record.amount.toLocaleString()}</span>
                       </div>
                       <button 
                         onClick={() => toggleCommissionStatus(record.billId, record.sessionId)}
                         className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 flex items-center space-x-2 ${record.isPaid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-900/20'}`}
                       >
                         {record.isPaid ? <><RefreshCcw size={14} /> <span>Mark Pending</span></> : <><IndianRupee size={14} /> <span>Pay Now</span></>}
                       </button>
                    </div>
                  </div>
                ))}
                {filteredRecords.length === 0 && (
                  <div className="text-center py-24 opacity-20">
                    <History size={64} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">No records found matching filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsView;