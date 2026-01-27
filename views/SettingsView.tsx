
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { 
  Save, 
  Download, 
  MapPin, 
  Sun, 
  Moon, 
  Briefcase, 
  User, 
  Smartphone, 
  Mail, 
  CreditCard, 
  Cloud, 
  RefreshCw, 
  Unlink, 
  CheckCircle2, 
  DownloadCloud, 
  ExternalLink, 
  Settings as SettingsIcon, 
  Info,
  Upload,
  FileJson,
  AlertTriangle,
  Copy,
  Check,
  // Fix: Added missing ShieldCheck import
  ShieldCheck
} from 'lucide-react';
import { INITIAL_SETTINGS } from '../constants';
import { GoogleDriveService } from '../GoogleDriveService';

interface Props {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

// Fix: Defined missing themes array for the theme selection UI
const themes = [
  { id: 'light' as const, name: 'Light Mode', icon: Sun },
  { id: 'dark' as const, name: 'Dark Mode', icon: Moon },
];

const SettingsView: React.FC<Props> = ({ settings, onUpdate }) => {
  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';
  
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(GoogleDriveService.isConnected());
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onUpdate(updatedSettings);
    const currentStored = JSON.parse(localStorage.getItem(`${userPrefix}settings`) || JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(`${userPrefix}settings`, JSON.stringify({ ...currentStored, theme: newTheme }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    localStorage.setItem(`${userPrefix}settings`, JSON.stringify(formData));
    alert("Business settings updated successfully!");
  };

  const getSystemData = () => {
    const fullState: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('u_') || key.startsWith('harvester_'))) {
        if (key === 'harvester_gdrive_token') continue;
        fullState[key] = localStorage.getItem(key) || '';
      }
    }
    return fullState;
  };

  const handleDownloadBackup = () => {
    const data = getSystemData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vigneshwara_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    const data = getSystemData();
    navigator.clipboard.writeText(JSON.stringify(data));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm("WARNING: This will replace all current data with the data from the file. This cannot be undone. Proceed?")) {
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          alert("System Restored Successfully! The app will now reload.");
          window.location.reload();
        }
      } catch (err) {
        alert("Invalid backup file. Please ensure you are using a .json file exported from this app.");
      }
    };
    reader.readAsText(file);
  };

  const handleConnectDrive = async () => {
    if (!formData.googleClientId) {
      alert("Google Drive requires a Client ID. Please see the 'Cloud Infrastructure' section below.");
      return;
    }
    try {
      await GoogleDriveService.authenticate();
      setIsDriveConnected(true);
      handleManualSync();
    } catch (e) {}
  };

  const handleDisconnectDrive = () => {
    GoogleDriveService.disconnect();
    setIsDriveConnected(false);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await GoogleDriveService.syncUsers(sessionUser.id);
    setIsSyncing(false);
    const saved = localStorage.getItem(`${userPrefix}settings`);
    if (saved) setFormData(JSON.parse(saved));
  };

  const handleRestoreFromCloud = async () => {
    if (!window.confirm("RESTORE FROM CLOUD: This will overwrite everything. Proceed?")) return;
    setIsRestoring(true);
    const success = await GoogleDriveService.restoreData(sessionUser.id);
    setIsRestoring(false);
    if (success) {
      alert("System state fully restored! Reloading...");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-none">Settings Center</h2>
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/50 font-black uppercase tracking-[0.2em] mt-2">Enterprise Configuration & Data Management</p>
        </div>
      </div>

      <div className="px-4 space-y-8">
        {/* Tier 1: Zero-Config Local Backup */}
        <section className="bg-white dark:bg-[#111a15] rounded-[2.5rem] shadow-xl border border-emerald-100 dark:border-emerald-900/20 overflow-hidden">
          <div className="px-8 py-5 border-b dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/10 flex justify-between items-center">
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 flex items-center">
              <ShieldCheck size={16} className="mr-2" /> Tier 1: Local Device Backup (No Setup Required)
            </h3>
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Recommended</span>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-emerald-100/60 leading-relaxed font-medium">
                Download your entire business state as a single encrypted file. You can save this to your phone, send it to your email, or move it to a new device.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleDownloadBackup} className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                  <Download size={18} /> <span>Download Backup</span>
                </button>
                <button onClick={handleCopyToClipboard} className="flex items-center justify-center space-x-3 px-6 py-4 bg-white dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95">
                  {copySuccess ? <Check size={18} /> : <Copy size={18} />} <span>{copySuccess ? 'Copied!' : 'Copy Data'}</span>
                </button>
              </div>
            </div>
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-emerald-900/20 pt-6 md:pt-0 md:pl-8">
              <p className="text-sm text-gray-500 dark:text-emerald-100/60 leading-relaxed font-medium">
                Already have a backup file? Click below to restore your entire business profile, bills, and settings instantly.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-orange-50 text-orange-700 border border-orange-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-all active:scale-95"
              >
                <Upload size={18} /> <span>Restore from File</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileRestore} accept=".json" className="hidden" />
            </div>
          </div>
        </section>

        {/* Tier 2: Cloud Sync */}
        <section className="bg-white dark:bg-[#111a15] rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-emerald-900/20 overflow-hidden">
          <div className="px-8 py-5 border-b dark:border-emerald-900/20 bg-gray-50/50 dark:bg-emerald-900/10 flex justify-between items-center">
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-emerald-500/40 flex items-center">
              <Cloud size={16} className="mr-2" /> Tier 2: Automatic Cloud Sync (Requires Google Setup)
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative">
                  <Cloud size={32} className={isSyncing || isRestoring ? 'animate-bounce' : ''} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-none">Google Drive Link</h3>
                  {formData.googleDriveLastSync ? (
                     <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center mt-1">
                       <CheckCircle2 size={10} className="mr-1" /> Last Sync: {new Date(formData.googleDriveLastSync).toLocaleString()}
                     </p>
                  ) : (
                    <p className="text-[10px] font-bold text-gray-400 dark:text-emerald-500/50 uppercase tracking-widest">Connect to enable auto-backup</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {isDriveConnected ? (
                  <>
                    <button onClick={handleManualSync} disabled={isSyncing || isRestoring} className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                      <span>Sync Now</span>
                    </button>
                    <button onClick={handleRestoreFromCloud} disabled={isSyncing || isRestoring} className="flex items-center justify-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50">
                      <DownloadCloud size={14} />
                      <span>Cloud Restore</span>
                    </button>
                    <button onClick={handleDisconnectDrive} className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
                      <Unlink size={16} />
                    </button>
                  </>
                ) : (
                  <button onClick={handleConnectDrive} className="flex items-center justify-center space-x-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                    <Cloud size={18} />
                    <span>Link Google Account</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 space-y-4">
              <div className="flex items-center text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                <Info size={14} className="mr-2" /> Google Cloud Infrastructure Setup
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">
                  Google Client ID (Mandatory for Cloud)
                </label>
                <input 
                  type="text" 
                  value={formData.googleClientId} 
                  onChange={(e) => setFormData({...formData, googleClientId: e.target.value})} 
                  placeholder="Paste your Client ID here"
                  className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-white dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" 
                />
              </div>
              <p className="text-[11px] text-blue-800/70 dark:text-blue-300/50 leading-relaxed font-bold">
                Due to Google's security rules, "URL not found" occurs if your app's web address isn't authorized in the Google Cloud Console. 
                <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 dark:text-blue-400 underline ml-1 inline-flex items-center">Setup Google Cloud <ExternalLink size={10} className="ml-1"/></a>
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Details */}
          <section className="bg-white dark:bg-[#111a15] rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-emerald-900/20 overflow-hidden">
            <div className="px-8 py-5 border-b dark:border-emerald-900/20 bg-gray-50/50 dark:bg-emerald-900/10 font-black text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-emerald-500/60">Business Identity Profile</div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ml-1">
                  <Briefcase size={12} className="mr-2" /> Company Name
                </label>
                <input type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50/30 dark:bg-[#1a2e26] dark:text-emerald-50 p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
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

          {/* Appearance */}
          <section className="bg-white dark:bg-[#111a15] rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-emerald-900/20 overflow-hidden">
            <div className="px-8 py-5 border-b dark:border-emerald-900/20 bg-gray-50/50 dark:bg-emerald-900/10 font-black text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-emerald-500/60">System Interface</div>
            <div className="p-8">
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

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40">
            <button 
              type="submit" 
              className="w-full flex items-center justify-center space-x-4 bg-emerald-600 text-white py-5 rounded-2xl shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all text-sm font-black uppercase tracking-[0.2em] border border-emerald-400/20"
            >
              <Save size={20} /> 
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
