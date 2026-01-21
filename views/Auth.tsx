
import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  ChevronLeft, 
  Building2, 
  MapPin, 
  UserCheck,
  KeyRound
} from 'lucide-react';
import { User, AppSettings } from '../types';
import { INITIAL_SETTINGS } from '../constants';

interface Props {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    userName: '', // Full Name
    userId: '',   // Username for login
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users: User[] = JSON.parse(localStorage.getItem('harvester_users') || '[]');
    const loginId = formData.userId.trim();
    const loginPassword = formData.password.trim();

    const foundUser = users.find(u => 
      (u.userId === loginId || u.email === loginId) && u.password === loginPassword
    );

    if (foundUser) {
      onLogin(foundUser);
    } else if (loginId === 'admin' && loginPassword === 'admin') {
      onLogin({
        id: 'admin-id',
        name: 'Admin',
        email: 'Palwaimahi@gmail.com',
        userId: 'admin',
        mobile: '9966146633'
      });
    } else {
      setError('Invalid User ID or Password.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('harvester_users') || '[]');
    if (users.some(u => u.userId === formData.userId)) {
      setError('This User ID is already taken. Try another.');
      return;
    }

    const newUserId = Math.random().toString(36).substr(2, 9);
    
    // 1. Create User Profile
    const newUser: User = {
      id: newUserId,
      name: formData.userName,
      email: formData.email,
      userId: formData.userId,
      mobile: formData.mobile,
      password: formData.password
    };

    // 2. Create and Store Business Settings for this user
    const userSettings: AppSettings = {
      ...INITIAL_SETTINGS,
      companyName: formData.businessName,
      ownerName: formData.ownerName,
      address: formData.address,
      mobile: formData.mobile,
      email: formData.email
    };

    localStorage.setItem('harvester_users', JSON.stringify([...users, newUser]));
    localStorage.setItem(`u_${newUserId}_settings`, JSON.stringify(userSettings));
    
    setSuccessMsg('Business Registered! You can now log in.');
    setMode('LOGIN');
    // Clear sensitive fields
    setFormData({ ...formData, password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col justify-center items-center p-4 py-12">
      <div className={`w-full ${mode === 'LOGIN' ? 'max-w-md' : 'max-w-2xl'} bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-emerald-100/50 transition-all duration-500`}>
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200">
            <ShieldCheck className="text-emerald-600" size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Vigneshwara</h1>
          <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Enterprise Harvester System</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 animate-pulse">{error}</div>}
        {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 text-xs font-black rounded-2xl border border-emerald-100">{successMsg}</div>}

        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure User ID</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="userId"
                  required
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 transition-all"
                  placeholder="Enter Username"
                />
                <UserIcon className="absolute left-4 top-4 text-gray-400" size={20} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-sm mt-8">
              <span>Access Business Portal</span>
              <ArrowRight size={20} />
            </button>
            <div className="text-center pt-8 border-t border-gray-50">
              <p className="text-gray-400 text-xs font-bold mb-2">New here?</p>
              <button type="button" onClick={() => setMode('SIGNUP')} className="text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest decoration-2 underline-offset-4 underline">Register New Business</button>
            </div>
          </form>
        )}

        {mode === 'SIGNUP' && (
          <form onSubmit={handleSignUp} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setMode('LOGIN')} className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
              <ChevronLeft size={16} className="mr-1"/> Return to Login
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left Column: Business Info */}
              <div className="space-y-5">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-50">
                  <Building2 size={18} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Business Identity</h3>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                  <div className="relative">
                    <input type="text" name="businessName" required value={formData.businessName} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Vigneshwara Harvester" />
                    <Building2 className="absolute left-3.5 top-3 text-emerald-400/50" size={18} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Owner Full Name</label>
                  <div className="relative">
                    <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="P. Mahendher Reddy" />
                    <UserCheck className="absolute left-3.5 top-3 text-emerald-400/50" size={18} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Address</label>
                  <div className="relative">
                    <textarea name="address" required value={formData.address} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-[92px] resize-none" placeholder="Telangana, Near Market..." />
                    <MapPin className="absolute left-3.5 top-3.5 text-emerald-400/50" size={18} />
                  </div>
                </div>
              </div>

              {/* Right Column: User Credentials */}
              <div className="space-y-5">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-50">
                  <KeyRound size={18} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">System Credentials</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">User ID / Username</label>
                  <div className="relative">
                    <input type="text" name="userId" required value={formData.userId} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="mahi_reddy" />
                    <UserIcon className="absolute left-3.5 top-3 text-emerald-400/50" size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile</label>
                    <div className="relative">
                      <input type="tel" name="mobile" required value={formData.mobile} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="99..." />
                      <Smartphone className="absolute left-3.5 top-3 text-emerald-400/50" size={18} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="abc@..." />
                      <Mail className="absolute left-3.5 top-3 text-emerald-400/50" size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                  <div className="relative">
                    <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="••••••••" />
                    <Lock className="absolute left-3.5 top-3 text-emerald-400/50" size={18} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="••••••••" />
                    <Lock className="absolute left-3.5 top-3 text-emerald-400/50" size={18} />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-sm mt-8">
              <span>Initialize Business Profile</span>
              <ArrowRight size={20} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;