
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { Save, Download, MapPin, Sun, Moon, Briefcase, User, Smartphone, Mail, CreditCard } from 'lucide-react';
import { INITIAL_SETTINGS } from '../constants';

interface Props {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdate }) => {
  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';
  
  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    const saved = localStorage.getItem(`${userPrefix}settings`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
    }
  }, [userPrefix]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    const updatedSettings = { ...formData, theme: newTheme };
    setFormData(updatedSettings);
    
    // Apply globally immediately
    onUpdate(updatedSettings);
    
    // Persist immediately
    const currentStored = JSON.parse(localStorage.getItem(`${userPrefix}settings`) || JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(`${userPrefix}settings`, JSON.stringify({ ...currentStored, theme: newTheme }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    localStorage.setItem(`${userPrefix}settings`, JSON.stringify(formData));
    alert("Business settings updated successfully!");
  };

  const handleBackup = () => {
    const data = {
      settings: formData,
      bills: JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]'),
      expenses: JSON.parse(localStorage.getItem(`${userPrefix}expenses`) || '[]'),
      vehicles: JSON.parse(localStorage.getItem(`${userPrefix}vehicles`) || '[]'),
      drivers: JSON.parse(localStorage.getItem(`${userPrefix}drivers`) || '[]'),
      agents: JSON.parse(localStorage.getItem(`${userPrefix}agents`) || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harvester_backup_${sessionUser.userId}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const themes: { id: 'light' | 'dark', name: string, icon: any }[] = [
    { id: 'light', name: 'Light Mode', icon: Sun },
    { id: 'dark', name: 'Dark Mode', icon: Moon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-none">Settings</h2>
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/50 font-black uppercase tracking-[0.2em] mt-2">Enterprise Profile Configuration</p>
        </div>
        <button 
          onClick={handleBackup} 
          className="w-full md:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-white dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/30 rounded-2xl text-gray-700 dark:text-emerald-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-gray-200/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-[#213a30]"
        >
          <Download size={18} /> 
          <span>Download Data Backup</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-4">
        {/* Line by Line Theme Selector */}
        <section className="bg-white dark:bg-[#111a15] rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-emerald-900/20 overflow-hidden">
          <div className="px-8 py-5 border-b dark:border-emerald-900/20 bg-gray-50/50 dark:bg-emerald-900/10 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-emerald-500/60">Appearance</div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                  className={`flex items-center p-6 rounded-[2rem] border-2 transition-all group ${
                    formData.theme === theme.id 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-900/20' 
                    : 'bg-white dark:bg-[#1a2e26] border-gray-50 dark:border-emerald-900/20 text-gray-400 dark:text-emerald-500/50 hover:border-emerald-400/30'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${formData.theme === theme.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-emerald-950/50'}`}>
                    <theme.icon size={24} className={formData.theme === theme.id ? 'text-white' : 'text-emerald-600'} />
                  </div>
                  <span className={`ml-4 text-[11px] font-black uppercase tracking-widest ${formData.theme === theme.id ? 'text-white' : 'text-gray-500 dark:text-emerald-100'}`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Business Details - Strict Line by Line */}
        <section className="bg-white dark:bg-[#111a15] rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-emerald-900/20 overflow-hidden">
          <div className="px-8 py-5 border-b dark:border-emerald-900/20 bg-gray-50/50 dark:bg-emerald-900/10 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-emerald-500/60">Business Identity</div>
          
          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                <Briefcase size={12} className="mr-2" /> Company Name
              </label>
              <input type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                <Sun size={12} className="mr-2" /> Short Description
              </label>
              <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                <MapPin size={12} className="mr-2" /> Official Address
              </label>
              <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[100px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                  <User size={12} className="mr-2" /> Proprietor Name
                </label>
                <input type="text" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                  <Smartphone size={12} className="mr-2" /> Primary Mobile
                </label>
                <input type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                  <Mail size={12} className="mr-2" /> Business Email
                </label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                  <CreditCard size={12} className="mr-2" /> UPI ID for Receipts
                </label>
                <input type="text" value={formData.upiId} onChange={(e) => setFormData({...formData, upiId: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
              </div>
            </div>
          </div>
        </section>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40">
          <button 
            type="submit" 
            className="w-full flex items-center justify-center space-x-4 bg-emerald-600 text-white py-5 rounded-2xl shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all text-sm font-black uppercase tracking-[0.2em] border border-emerald-400/20"
          >
            <Save size={20} /> 
            <span>Commit Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
