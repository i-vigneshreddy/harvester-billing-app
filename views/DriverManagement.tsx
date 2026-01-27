
import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { UserCircle, Phone, Plus, Trash2, History, Save } from 'lucide-react';
import { GoogleDriveService } from '../GoogleDriveService';

const DriverManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showForm, setShowForm] = useState(false);

  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';

  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    name: '',
    mobile: '',
    workStartDate: new Date().toISOString().split('T')[0],
    salaryPerMonth: 0,
    advanceAmount: 0
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`${userPrefix}drivers`) || '[]');
    setDrivers(saved);
  }, [userPrefix]);

  const handleAdd = async () => {
    if (!newDriver.name || !newDriver.salaryPerMonth) {
      alert("Name and Salary are required.");
      return;
    }
    const driver: Driver = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDriver.name!,
      mobile: newDriver.mobile || '',
      workStartDate: newDriver.workStartDate!,
      salaryPerMonth: Number(newDriver.salaryPerMonth),
      advanceAmount: Number(newDriver.advanceAmount),
      pendingAmount: Number(newDriver.salaryPerMonth) - Number(newDriver.advanceAmount),
      paymentHistory: []
    };
    const updated = [...drivers, driver];
    setDrivers(updated);
    localStorage.setItem(`${userPrefix}drivers`, JSON.stringify(updated));

    // Cloud Sync
    if (GoogleDriveService.isConnected()) {
      await GoogleDriveService.syncUsers(sessionUser.id);
    }

    setNewDriver({
      name: '',
      mobile: '',
      workStartDate: new Date().toISOString().split('T')[0],
      salaryPerMonth: 0,
      advanceAmount: 0
    });
    setShowForm(false);
  };

  const removeDriver = async (id: string) => {
    if (confirm("Delete this driver record?")) {
      const updated = drivers.filter(d => d.id !== id);
      setDrivers(updated);
      localStorage.setItem(`${userPrefix}drivers`, JSON.stringify(updated));
      
      // Cloud Sync
      if (GoogleDriveService.isConnected()) {
        await GoogleDriveService.syncUsers(sessionUser.id);
      }
      
      setNewDriver({
        name: '',
        mobile: '',
        workStartDate: new Date().toISOString().split('T')[0],
        salaryPerMonth: 0,
        advanceAmount: 0
      });
      setShowForm(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight uppercase">Driver & Staff</h2>
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/50 font-black uppercase tracking-widest mt-1">Salary & Advance Ledger</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`px-6 py-3 rounded-2xl flex items-center font-black transition-all shadow-lg text-[10px] uppercase tracking-widest ${showForm ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {showForm ? <><Plus size={16} className="mr-2" /> Cancel</> : <><Plus size={16} className="mr-2" /> Hire Driver</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#121a16] p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-emerald-900/10 animate-in slide-in-from-top duration-300 mx-2">
          <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 mb-6 flex items-center uppercase tracking-widest">
            <UserCircle size={20} className="mr-2" /> Staff Registry Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" placeholder="Driver Name" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} className="w-full border border-gray-100 dark:border-emerald-900/20 bg-gray-50/50 dark:bg-[#1a2e26] dark:text-emerald-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Mobile No</label>
              <input type="tel" placeholder="10 Digit Number" value={newDriver.mobile} onChange={e => setNewDriver({...newDriver, mobile: e.target.value})} className="w-full border border-gray-100 dark:border-emerald-900/20 bg-gray-50/50 dark:bg-[#1a2e26] dark:text-emerald-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Engagement Date</label>
              <input type="date" value={newDriver.workStartDate} onChange={e => setNewDriver({...newDriver, workStartDate: e.target.value})} className="w-full border border-gray-100 dark:border-emerald-900/20 bg-gray-50/50 dark:bg-[#1a2e26] dark:text-emerald-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Monthly Salary (₹)</label>
              <input type="number" placeholder="0" value={newDriver.salaryPerMonth || ''} onChange={e => setNewDriver({...newDriver, salaryPerMonth: Number(e.target.value)})} className="w-full border border-gray-100 dark:border-emerald-900/20 bg-gray-50/50 dark:bg-[#1a2e26] dark:text-emerald-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Joining Advance (₹)</label>
              <input type="number" placeholder="0" value={newDriver.advanceAmount || ''} onChange={e => setNewDriver({...newDriver, advanceAmount: Number(e.target.value)})} className="w-full border border-gray-100 dark:border-emerald-900/20 bg-gray-50/50 dark:bg-[#1a2e26] dark:text-emerald-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleAdd}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center tracking-widest uppercase text-xs"
              >
                <Save size={18} className="mr-2" /> Commit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
        {drivers.map(driver => (
          <div key={driver.id} className="bg-white dark:bg-[#121a16] p-8 rounded-[2.5rem] border border-gray-100 dark:border-emerald-900/10 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl border border-emerald-100 dark:border-emerald-800/50 shadow-inner group-hover:scale-110 transition-transform">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight uppercase">{driver.name}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-emerald-500/50 font-black uppercase tracking-widest flex items-center mt-3"><Phone size={12} className="mr-1.5 text-emerald-500" /> {driver.mobile}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-300 dark:text-emerald-900/40 uppercase tracking-widest">Since</p>
                <p className="text-xs font-black text-gray-600 dark:text-emerald-200/40">{driver.workStartDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50/50 dark:bg-emerald-900/10 rounded-2xl border border-gray-100 dark:border-emerald-900/10">
                <p className="text-[9px] font-black text-gray-400 dark:text-emerald-500/30 uppercase tracking-widest block mb-1">Monthly</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">₹{driver.salaryPerMonth}</p>
              </div>
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Advance</p>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 tracking-tight">₹{driver.advanceAmount}</p>
              </div>
              <div className="p-4 bg-red-50/50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest block mb-1">Pending</p>
                <p className="text-sm font-black text-red-700 dark:text-red-300 tracking-tight">₹{driver.pendingAmount}</p>
              </div>
            </div>

            <div className="flex space-x-2 pt-6 border-t border-gray-50 dark:border-emerald-900/10">
              <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] hover:bg-emerald-700 active:scale-95 transition-all shadow-lg uppercase tracking-[0.2em]">Settlement</button>
              <button className="p-4 bg-white dark:bg-emerald-900/20 text-gray-400 dark:text-emerald-400 border border-gray-100 dark:border-emerald-900/20 rounded-2xl hover:text-emerald-600 transition-all"><History size={18}/></button>
              <button onClick={() => removeDriver(driver.id)} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-400 rounded-2xl hover:text-red-600 transition-all"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
        {drivers.length === 0 && !showForm && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 dark:border-emerald-900/10 rounded-[3rem] bg-white dark:bg-[#121a16] shadow-sm">
             <UserCircle size={48} className="mx-auto mb-4 opacity-10 text-emerald-600" />
             <p className="font-bold uppercase tracking-widest text-[10px] text-gray-400 dark:text-emerald-500/20">No staff members registered</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverManagement;
