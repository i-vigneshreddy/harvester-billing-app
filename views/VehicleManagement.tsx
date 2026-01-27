
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck, Tag, Hash, X, Save } from 'lucide-react';
import { Vehicle, VehicleType } from '../types';
import { GoogleDriveService } from '../GoogleDriveService';

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';

  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    name: '',
    type: VehicleType.HARVESTER,
    number: ''
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`${userPrefix}vehicles`) || '[]');
    setVehicles(saved);
  }, [userPrefix]);

  const handleAdd = async () => {
    if (!newVehicle.name || !newVehicle.number) {
      alert("Please provide both machine name and number.");
      return;
    }
    const vehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      name: newVehicle.name!,
      type: newVehicle.type!,
      number: newVehicle.number!
    };
    const updated = [...vehicles, vehicle];
    setVehicles(updated);
    localStorage.setItem(`${userPrefix}vehicles`, JSON.stringify(updated));
    
    // Cloud Sync
    if (GoogleDriveService.isConnected()) {
      await GoogleDriveService.syncUsers(sessionUser.id);
    }
    
    // Clear form
    setNewVehicle({ name: '', type: VehicleType.HARVESTER, number: '' });
    setShowForm(false);
  };

  const removeVehicle = async (id: string) => {
    if (confirm("Permanently remove this machine from inventory?")) {
      const updated = vehicles.filter(v => v.id !== id);
      setVehicles(updated);
      localStorage.setItem(`${userPrefix}vehicles`, JSON.stringify(updated));
      
      // Cloud Sync
      if (GoogleDriveService.isConnected()) {
        await GoogleDriveService.syncUsers(sessionUser.id);
      }
      
      setNewVehicle({ name: '', type: VehicleType.HARVESTER, number: '' });
      setShowForm(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-none">Machine Inventory</h2>
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/60 font-black uppercase tracking-[0.2em] mt-2">Manage Fleet Assets</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) {
              setNewVehicle({ name: '', type: VehicleType.HARVESTER, number: '' });
            }
            setShowForm(!showForm);
          }} 
          className={`px-6 py-3.5 rounded-2xl flex items-center font-black transition-all shadow-lg text-xs uppercase tracking-widest ${showForm ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'}`}
        >
          {showForm ? <><X size={18} className="mr-2" /> Cancel Action</> : <><Plus size={18} className="mr-2" /> Add New Machine</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#121a16] p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-emerald-900/20 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Machine Name</label>
              <input 
                type="text" 
                placeholder="Ex: John Deere 50G"
                value={newVehicle.name} 
                onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} 
                className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-50 transition-all text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Category Type</label>
              <select 
                value={newVehicle.type} 
                onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value as VehicleType})} 
                className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-50 transition-all text-sm appearance-none cursor-pointer"
              >
                {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Serial / Reg Number</label>
              <input 
                type="text" 
                placeholder="Ex: TS-00-AA-0000"
                value={newVehicle.number} 
                onChange={(e) => setNewVehicle({...newVehicle, number: e.target.value})} 
                className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-50 transition-all text-sm" 
              />
            </div>
          </div>
          <button 
            onClick={handleAdd} 
            className="mt-8 w-full bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:bg-emerald-700 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3"
          >
            <Save size={18} />
            <span>Register Machine to Fleet</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white dark:bg-[#121a16] p-8 rounded-[2.5rem] border border-gray-100 dark:border-emerald-900/20 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <button 
              onClick={() => removeVehicle(v.id)} 
              className="absolute top-6 right-6 p-2 text-gray-300 dark:text-emerald-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10 bg-gray-50 dark:bg-emerald-950/30 rounded-xl"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex items-center mb-8 relative z-10">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl mr-5 shadow-inner border border-emerald-100 dark:border-emerald-800/50">
                <Truck size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 dark:text-gray-100 text-xl tracking-tight uppercase leading-none">{v.name}</h4>
                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/40 uppercase tracking-widest mt-1.5">Asset ID: {v.id.toUpperCase()}</div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-3.5 bg-gray-50/50 dark:bg-emerald-900/10 rounded-2xl border border-gray-100 dark:border-emerald-900/10">
                 <div className="flex items-center text-[10px] font-black text-gray-400 dark:text-emerald-500/30 uppercase tracking-widest">
                   <Tag size={12} className="mr-2 text-emerald-500" /> Category
                 </div>
                 <div className="text-xs font-black text-gray-700 dark:text-emerald-100 uppercase tracking-tight">{v.type}</div>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-gray-50/50 dark:bg-emerald-900/10 rounded-2xl border border-gray-100 dark:border-emerald-900/10">
                 <div className="flex items-center text-[10px] font-black text-gray-400 dark:text-emerald-500/30 uppercase tracking-widest">
                   <Hash size={12} className="mr-2 text-emerald-500" /> Plate No
                 </div>
                 <div className="text-xs font-black text-gray-700 dark:text-emerald-100 font-mono">{v.number}</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-emerald-900/10">
               <div className="flex items-center justify-between">
                 <span className="text-[9px] font-black text-emerald-600/30 uppercase tracking-[0.2em]">Operational Status</span>
                 <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Fleet</span>
                 </div>
               </div>
            </div>
          </div>
        ))}
        
        {vehicles.length === 0 && !showForm && (
          <div className="col-span-full py-28 text-center bg-white dark:bg-[#121a16] border-2 border-dashed border-gray-100 dark:border-emerald-900/20 rounded-[3rem] shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck size={40} className="text-gray-200 dark:text-emerald-900/30" />
            </div>
            <p className="font-black uppercase tracking-[0.3em] text-xs text-gray-300 dark:text-emerald-900/30">No machines registered in inventory</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-6 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              Initialize Fleet Registry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManagement;
