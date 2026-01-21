
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, Vehicle, AppNotification, NotificationType } from '../types';
import { Plus, Fuel, Utensils, FileText, Wallet, Trash2, Camera, ZoomIn, X, Eye } from 'lucide-react';

interface Props {
  onNewNotification?: (notif: Partial<AppNotification>) => void;
}

const ExpensesView: React.FC<Props> = ({ onNewNotification }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState<string | null>(null);

  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';

  const [newExp, setNewExp] = useState<Partial<Expense>>({
    category: ExpenseCategory.DIESEL,
    amount: 0,
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    billCopyUrl: undefined
  });

  useEffect(() => {
    const savedExp = JSON.parse(localStorage.getItem(`${userPrefix}expenses`) || '[]');
    const savedVehicles = JSON.parse(localStorage.getItem(`${userPrefix}vehicles`) || '[]');
    setExpenses(savedExp);
    setVehicles(savedVehicles);
  }, [userPrefix]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExp({ ...newExp, billCopyUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newExp.amount || !newExp.vehicleId) {
      alert("Please select a vehicle and enter an amount.");
      return;
    }
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      category: newExp.category as ExpenseCategory,
      amount: newExp.amount!,
      vehicleId: newExp.vehicleId!,
      date: newExp.date!,
      billCopyUrl: newExp.billCopyUrl
    };
    const updated = [expense, ...expenses];
    setExpenses(updated);
    localStorage.setItem(`${userPrefix}expenses`, JSON.stringify(updated));

    // Trigger Notification for major expenses
    if (onNewNotification) {
      const vehicle = vehicles.find(v => v.id === expense.vehicleId);
      if (expense.category === ExpenseCategory.DIESEL) {
        onNewNotification({
          title: `Diesel Refill: ${vehicle?.name}`,
          message: `Operational cost of ₹${expense.amount} recorded for ${vehicle?.number}.`,
          type: NotificationType.EXPENSE
        });
      } else if (expense.amount > 5000) {
        onNewNotification({
          title: 'High Expense Recorded',
          message: `A significant cost of ₹${expense.amount} was logged under ${expense.category}.`,
          type: NotificationType.EXPENSE
        });
      }
    }

    setNewExp({ 
      category: ExpenseCategory.DIESEL,
      amount: 0,
      vehicleId: '',
      date: new Date().toISOString().split('T')[0],
      billCopyUrl: undefined 
    });
    setShowForm(false);
  };

  const deleteExpense = (id: string) => {
    if (confirm("Delete this expense record?")) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      localStorage.setItem(`${userPrefix}expenses`, JSON.stringify(updated));
      
      // Clear form after deletion
      setNewExp({ 
        category: ExpenseCategory.DIESEL,
        amount: 0,
        vehicleId: '',
        date: new Date().toISOString().split('T')[0],
        billCopyUrl: undefined 
      });
      setShowForm(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Operational Expenses</h2>
          <p className="text-sm text-gray-500 font-medium">Record and track all harvester maintenance and operational costs.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-2.5 rounded-xl flex items-center font-bold transition-all shadow-md ${showForm ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {showForm ? 'Close Form' : <><Plus size={18} className="mr-2" /> Record Expense</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-50 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vehicle</label>
              <select 
                value={newExp.vehicleId}
                onChange={(e) => setNewExp({...newExp, vehicleId: e.target.value})}
                className="w-full bg-white border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700 transition-all"
              >
                <option value="">Choose Vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={newExp.category}
                onChange={(e) => setNewExp({...newExp, category: e.target.value as ExpenseCategory})}
                className="w-full bg-white border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700 transition-all"
              >
                {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₹)</label>
              <input 
                type="number" 
                value={newExp.amount || ''}
                onChange={(e) => setNewExp({...newExp, amount: Number(e.target.value)})}
                className="w-full bg-white border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700 transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
              <input 
                type="date" 
                value={newExp.date}
                onChange={(e) => setNewExp({...newExp, date: e.target.value})}
                className="w-full bg-white border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bill Copy</label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer bg-white border border-dashed border-gray-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                  <Camera size={16} className="mr-2 text-emerald-600" /> 
                  <span className="font-bold text-gray-500">{newExp.billCopyUrl ? 'Change' : 'Upload Image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {newExp.billCopyUrl && (
                  <button 
                    onClick={() => setShowImageZoom(newExp.billCopyUrl!)}
                    className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors shadow-sm"
                    title="Preview Uploaded Bill"
                  >
                    <ZoomIn size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center tracking-tight uppercase"
          >
            <Wallet size={20} className="mr-2" /> SAVE EXPENSE RECORD
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Vehicle Details</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-emerald-50/20 transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">{exp.date}</td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-gray-900">
                      {vehicles.find(v => v.id === exp.vehicleId)?.name || 'Unknown Vehicle'}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {vehicles.find(v => v.id === exp.vehicleId)?.number || 'No Number'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center text-sm font-bold text-gray-700">
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        {exp.category === ExpenseCategory.DIESEL && <Fuel size={14} />}
                        {exp.category === ExpenseCategory.FOOD && <Utensils size={14} />}
                        {exp.category === ExpenseCategory.TAX_TOLL && <FileText size={14} />}
                        {![ExpenseCategory.DIESEL, ExpenseCategory.FOOD, ExpenseCategory.TAX_TOLL].includes(exp.category) && <Wallet size={14} />}
                      </div>
                      {exp.category}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="text-sm font-black text-red-600">₹{exp.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center items-center space-x-2">
                      {exp.billCopyUrl && (
                        <button 
                          onClick={() => setShowImageZoom(exp.billCopyUrl!)}
                          className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm"
                          title="View Bill Image"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteExpense(exp.id)} 
                        className="p-2.5 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all shadow-sm"
                        title="Delete Entry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Wallet size={48} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">No expense records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageZoom && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in" 
          onClick={() => setShowImageZoom(null)}
        >
          <div className="relative max-w-full max-h-full p-2 bg-white rounded-3xl shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <img src={showImageZoom} alt="Bill Preview" className="max-h-[80vh] rounded-2xl shadow-inner border border-gray-100" />
            <button 
              onClick={() => setShowImageZoom(null)}
              className="absolute -top-12 right-0 text-white flex items-center space-x-2 bg-red-600 px-6 py-2 rounded-full font-black shadow-lg hover:bg-red-700 transition-all tracking-tight uppercase text-xs"
            >
              <X size={18} /> <span>Close Preview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
