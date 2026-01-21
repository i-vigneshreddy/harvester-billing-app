import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Shield, Mail, Smartphone, Plus, UserPlus, Trash2, Edit, X, Save, KeyRound, Eye, EyeOff, UserCheck } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    mobile: '',
    userId: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    // Fetch users from the same key used in Auth.tsx signup
    const saved = JSON.parse(localStorage.getItem('harvester_users') || '[]');
    setUsers(saved);
  }, []);

  const resetForm = () => {
    setNewUser({
      name: '',
      mobile: '',
      userId: '',
      email: '',
      password: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      mobile: user.mobile,
      userId: user.userId,
      email: user.email,
      password: user.password
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdate = () => {
    if (!newUser.name || !newUser.userId) {
      alert("Name and User ID are mandatory fields.");
      return;
    }

    const allUsers: User[] = JSON.parse(localStorage.getItem('harvester_users') || '[]');
    
    if (editingUser) {
      const updatedUsers = allUsers.map(u => 
        u.id === editingUser.id ? { ...u, ...newUser as User } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('harvester_users', JSON.stringify(updatedUsers));
      alert("User account updated successfully!");
    } else {
      if (allUsers.some(u => u.userId === newUser.userId)) {
        alert("This User ID is already taken. Please choose another.");
        return;
      }
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name!,
        mobile: newUser.mobile || '',
        userId: newUser.userId!,
        email: newUser.email!,
        password: newUser.password!
      };
      const updated = [...allUsers, user];
      setUsers(updated);
      localStorage.setItem('harvester_users', JSON.stringify(updated));
      alert("New user registered successfully!");
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user? They will lose access to the system immediately.")) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('harvester_users', JSON.stringify(updated));
      
      // Clear form after deletion if the user being edited is the one deleted
      if (editingUser?.id === id) {
        resetForm();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase flex items-center">
            <Shield className="mr-2 text-emerald-600" size={24} /> User Access Control
          </h2>
          <p className="text-xs text-gray-500 dark:text-emerald-500/50 font-bold uppercase tracking-widest mt-1">Management of signup data and system access</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }} 
          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl flex items-center justify-center font-black transition-all shadow-lg text-[10px] uppercase tracking-widest ${showForm ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'}`}
        >
          {showForm ? <><X size={18} className="mr-2" /> Close Form</> : <><UserPlus size={18} className="mr-2" /> Add New Team Member</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#121a16] p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-emerald-50 dark:border-emerald-900/20 animate-in slide-in-from-top-4 duration-300 mx-2">
          <div className="flex items-center space-x-2 mb-8 pb-4 border-b dark:border-emerald-900/10">
             <UserCheck className="text-emerald-600" size={20} />
             <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
               {editingUser ? 'Edit User Credentials' : 'Register New Enterprise User'}
             </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Ex: Rajesh Kumar" 
                value={newUser.name} 
                onChange={e => setNewUser({...newUser, name: e.target.value})} 
                className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 transition-all text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Unique Username (User ID)</label>
              <input 
                type="text" 
                placeholder="login_id" 
                value={newUser.userId} 
                onChange={e => setNewUser({...newUser, userId: e.target.value})} 
                className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 transition-all text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Mobile Contact</label>
              <input 
                type="tel" 
                placeholder="10-digit number" 
                value={newUser.mobile} 
                onChange={e => setNewUser({...newUser, mobile: e.target.value})} 
                className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 transition-all text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@business.com" 
                value={newUser.email} 
                onChange={e => setNewUser({...newUser, email: e.target.value})} 
                className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 transition-all text-sm" 
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-widest ml-1">Account Password</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Set login password" 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  className="w-full bg-gray-50/50 dark:bg-[#1a2e26] border border-gray-100 dark:border-emerald-900/20 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 transition-all text-sm" 
                />
                <KeyRound className="absolute left-4 top-4 text-emerald-400/50" size={20} />
              </div>
            </div>
            
            <button 
              onClick={handleAddOrUpdate} 
              className="md:col-span-2 bg-emerald-600 text-white font-black rounded-2xl p-5 shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3"
            >
              <Save size={18} />
              <span>{editingUser ? 'Save Account Changes' : 'Initialize New User'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Users Desktop Table / Mobile Card List */}
      <div className="bg-white dark:bg-[#121a16] rounded-[2rem] shadow-xl border border-gray-50 dark:border-emerald-900/20 overflow-hidden mx-2">
        {/* Mobile-Friendly Grid (visible on small screens) */}
        <div className="md:hidden divide-y divide-gray-50 dark:divide-emerald-900/10">
          {users.map(user => (
            <div key={user.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center font-black text-emerald-700 dark:text-emerald-400 text-lg shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-gray-900 dark:text-gray-100 text-sm leading-none">{user.name}</div>
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md inline-block">@{user.userId}</div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleEditClick(user)} className="p-2.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(user.id)} className="p-2.5 text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl"><Trash2 size={16}/></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-tighter">
                <div className="bg-gray-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-gray-100 dark:border-emerald-900/10">
                  <span className="text-gray-400 dark:text-emerald-500/30 block mb-1">Mobile</span>
                  <span className="text-gray-700 dark:text-emerald-100 flex items-center"><Smartphone size={10} className="mr-1 text-emerald-500"/> {user.mobile || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-gray-100 dark:border-emerald-900/10">
                  <span className="text-gray-400 dark:text-emerald-500/30 block mb-1">Access Key</span>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-emerald-100 font-mono">{showPasswords[user.id] ? user.password : '••••••'}</span>
                    <button onClick={() => togglePassword(user.id)} className="text-emerald-500">
                      {showPasswords[user.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/30 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-50 dark:border-emerald-900/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center truncate">
                <Mail size={12} className="mr-2 flex-shrink-0" /> {user.email || 'No email registered'}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-emerald-900/5 border-b dark:border-emerald-900/10">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">Full Name / Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">Username</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">Contact Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">Access Credentials</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-emerald-900/10">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-emerald-50/10 dark:hover:bg-emerald-900/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center font-black text-emerald-700 dark:text-emerald-400 text-xs shadow-inner border border-emerald-200 dark:border-emerald-800/50">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 dark:text-gray-100 text-sm">{user.name}</div>
                        <div className="text-[9px] font-black text-emerald-500 dark:text-emerald-500/50 uppercase tracking-widest">Registered Member</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-black bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl inline-block border border-blue-100 dark:border-blue-900/30">
                      @{user.userId}
                    </div>
                  </td>
                  <td className="px-8 py-6 space-y-1.5">
                    <div className="text-[10px] font-bold text-gray-600 dark:text-emerald-100/60 flex items-center uppercase tracking-tighter">
                      <Smartphone size={12} className="mr-2 text-emerald-500"/> {user.mobile || 'No Contact'}
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 dark:text-emerald-100/60 flex items-center uppercase tracking-tighter">
                      <Mail size={12} className="mr-2 text-emerald-500"/> {user.email || 'No Email'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-emerald-900/10 px-3 py-2 rounded-xl border border-gray-100 dark:border-emerald-900/10 w-fit">
                      <KeyRound size={14} className="text-gray-400" />
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-emerald-100">
                        {showPasswords[user.id] ? user.password : '••••••••'}
                      </span>
                      <button onClick={() => togglePassword(user.id)} className="text-emerald-500 hover:text-emerald-700 transition-colors">
                        {showPasswords[user.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center items-center space-x-2">
                      <button 
                        onClick={() => handleEditClick(user)} 
                        className="p-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="p-3 text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 hover:text-red-600 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95"
                        title="Delete User"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <UserPlus size={48} className="mb-4" />
                      <p className="font-black uppercase tracking-[0.2em] text-xs">No user accounts found in registry</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;