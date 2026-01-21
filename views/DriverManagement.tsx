
import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { UserCircle, Phone, Plus, Trash2, History, Save } from 'lucide-react';

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

  const handleAdd = () => {
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
    setNewDriver({
      name: '',
      mobile: '',
      workStartDate: new Date().toISOString().split('T')[0],
      salaryPerMonth: 0,
      advanceAmount: 0
    });
    setShowForm(false);
  };

  const removeDriver = (id: string) => {
    if (confirm("Delete this driver record?")) {
      const updated = drivers.filter(d => d.id !== id);
      setDrivers(updated);
      localStorage.setItem(`${userPrefix}drivers`, JSON.stringify(updated));
      
      // Clear form after deletion
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Driver & Staff</h2>
          <p className="text-sm text-gray-500 font-medium">Manage driver salaries, advances and employment terms.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`px-6 py-2.5 rounded-xl flex items-center font-bold transition-all shadow-md ${showForm ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {showForm ? 'Cancel' : <><Plus size={18} className="mr-2" /> Hire New Driver</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-50 animate-in slide-in-from-top duration-300">
          <h3 className="text-lg font-black text-emerald-800 mb-6 flex items-center">
            <UserCircle size={20} className="mr-2" /> Driver Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Driver Name</label>
              <input type="text" placeholder="Full Name" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} className="w-full border border-gray-100 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile No</label>
              <input type="tel" placeholder="10 digit number" value={newDriver.mobile} onChange={e => setNewDriver({...newDriver, mobile: e.target.value})} className="w-full border border-gray-100 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
              <input type="date" value={newDriver.workStartDate} onChange={e => setNewDriver({...newDriver, workStartDate: e.target.value})} className="w-full border border-gray-100 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Salary (₹)</label>
              <input type="number" placeholder="0" value={newDriver.salaryPerMonth || ''} onChange={e => setNewDriver({...newDriver, salaryPerMonth: Number(e.target.value)})} className="w-full border border-gray-100 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Advance Paid (₹)</label>
              <input type="number" placeholder="0" value={newDriver.advanceAmount || ''} onChange={e => setNewDriver({...newDriver, advanceAmount: Number(e.target.value)})} className="w-full border border-gray-100 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleAdd}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center tracking-tight uppercase text-sm"
              >
                <Save size={18} className="mr-2" /> REGISTER DRIVER
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {drivers.map(driver => (
          <div key={driver.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-100 shadow-inner">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{driver.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center mt-1"><Phone size={12} className="mr-1 text-emerald-500" /> {driver.mobile}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Joined</p>
                <p className="text-sm font-bold text-gray-600">{driver.workStartDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Monthly Pay</p>
                <p className="text-md font-black text-gray-800 tracking-tight">₹{driver.salaryPerMonth}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Advances</p>
                <p className="text-md font-black text-emerald-700 tracking-tight">₹{driver.advanceAmount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Pending</p>
                <p className="text-md font-black text-red-700 tracking-tight">₹{driver.pendingAmount}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-md uppercase tracking-widest">Settlement</button>
              <button className="p-3 border border-gray-100 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"><History size={20}/></button>
              <button onClick={() => removeDriver(driver.id)} className="p-3 border border-red-50 bg-white text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
        {drivers.length === 0 && !showForm && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-white bg-opacity-50">
             <UserCircle size={48} className="mx-auto mb-4 opacity-10" />
             <p className="font-bold uppercase tracking-widest text-xs text-gray-400">No driver records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverManagement;
