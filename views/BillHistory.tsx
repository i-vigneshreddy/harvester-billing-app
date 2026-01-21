
import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Printer, MapPin, Phone, History as HistoryIcon, Filter, ArrowUpDown, ArrowUp, ArrowDown, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bill, PaymentType } from '../types';
import BillPreviewModal from '../components/BillPreviewModal';

type SortKey = 'customer' | 'totalAmount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const BillHistory: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'due' | 'paid'>('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';

  useEffect(() => {
    const savedBills = JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]');
    setBills(savedBills);
  }, [userPrefix]);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.customer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : (filter === 'due' ? bill.dueAmount > 0 : bill.dueAmount <= 0);
    return matchesSearch && matchesFilter;
  });

  const sortedBills = [...filteredBills].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aValue: any;
    let bValue: any;

    if (key === 'customer') {
      aValue = a.customer.name.toLowerCase();
      bValue = b.customer.name.toLowerCase();
    } else {
      aValue = a[key as keyof Bill];
      bValue = b[key as keyof Bill];
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 text-emerald-500" /> : <ArrowDown size={12} className="ml-1 text-emerald-500" />;
  };

  const deleteBill = (id: string) => {
    if (confirm("Permanently delete this billing record? This action cannot be undone.")) {
      const updated = bills.filter(b => b.id !== id);
      setBills(updated);
      localStorage.setItem(`${userPrefix}bills`, JSON.stringify(updated));
      // Clear selection after deletion
      setSelectedBill(null);
    }
  };

  const handleEdit = (bill: Bill) => {
    navigate('/new-billing', { state: { editBill: bill } });
  };

  const getPaymentBadgeStyle = (type: PaymentType) => {
    switch (type) {
      case PaymentType.CASH:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      case PaymentType.PHONEPE:
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800/30';
      case PaymentType.GOOGLE_PAY:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800/30';
      case PaymentType.ONLINE:
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getPaymentIcon = (type: PaymentType) => {
    switch (type) {
      case PaymentType.CASH: return <Banknote size={12} className="mr-1.5" />;
      case PaymentType.PHONEPE:
      case PaymentType.GOOGLE_PAY: return <Smartphone size={12} className="mr-1.5" />;
      case PaymentType.ONLINE: return <CreditCard size={12} className="mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center tracking-tighter">
            <HistoryIcon className="mr-3 text-emerald-600" size={32} /> Records & History
          </h2>
          <p className="text-gray-500 dark:text-emerald-500/60 font-medium">Search and manage all past harvester bills.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-3.5 text-gray-400 dark:text-emerald-500/50" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, village or ID..." 
              className="pl-12 pr-4 py-3 bg-white dark:bg-[#121a16] border border-gray-100 dark:border-emerald-900/20 rounded-2xl w-full focus:ring-2 focus:ring-emerald-500 dark:text-emerald-100 shadow-sm outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-3.5 text-gray-400 dark:text-emerald-500/50" size={18} />
            <select 
              className="pl-12 pr-10 py-3 bg-white dark:bg-[#121a16] border border-gray-100 dark:border-emerald-900/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:text-emerald-100 shadow-sm outline-none appearance-none font-bold text-gray-700 dark:text-emerald-200 transition-all cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">Everything</option>
              <option value="due">Pending Only</option>
              <option value="paid">Cleared Bills</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121a16] rounded-3xl shadow-xl border border-gray-50 dark:border-emerald-900/20 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-emerald-900/10 border-b dark:border-emerald-900/20">
                <th 
                  className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => requestSort('customer')}
                >
                  <div className="flex items-center">
                    Customer & Date {getSortIcon('customer')}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">
                  Location
                </th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">
                  Payment Method
                </th>
                <th 
                  className="px-8 py-5 text-right text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => requestSort('totalAmount')}
                >
                  <div className="flex items-center justify-end">
                    Grand Total {getSortIcon('totalAmount')}
                  </div>
                </th>
                <th 
                  className="px-8 py-5 text-right text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => requestSort('createdAt')}
                >
                  <div className="flex items-center justify-end">
                    Status {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-gray-400 dark:text-emerald-500/40 tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-emerald-900/10">
              {sortedBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-emerald-500 text-xs uppercase group-hover:bg-emerald-100 dark:group-hover:bg-emerald-700/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-100 transition-colors">
                        {bill.customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 dark:text-gray-100">{bill.customer.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-emerald-500/40 mt-0.5">{new Date(bill.createdAt).toLocaleDateString()} - {bill.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-600 dark:text-emerald-200/80 flex items-center">
                      <MapPin size={14} className="mr-2 text-emerald-500"/> {bill.customer.village}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400 dark:text-emerald-500/30 flex items-center mt-1">
                      <Phone size={10} className="mr-1"/> {bill.customer.mobile}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getPaymentBadgeStyle(bill.paymentType)}`}>
                      {getPaymentIcon(bill.paymentType)}
                      {bill.paymentType}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="text-sm font-black text-gray-900 dark:text-gray-100">
                      Rs. {bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {bill.dueAmount > 0 ? (
                      <div>
                        <div className="text-sm font-black text-red-600 dark:text-red-400">Rs. {bill.dueAmount.toLocaleString()} Due</div>
                        <div className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full inline-block font-bold mt-1 uppercase">Pending</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">Settled</div>
                        <div className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full inline-block font-bold mt-1 uppercase">Fully Paid</div>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center items-center space-x-2">
                      <button onClick={() => setSelectedBill(bill)} className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95" title="View Detailed Bill">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEdit(bill)} className="p-2.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95" title="Edit Record">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteBill(bill.id)} className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95" title="Delete Record">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedBills.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <HistoryIcon className="text-gray-200 dark:text-emerald-900/20 mb-4" size={40} />
                      <p className="text-gray-400 dark:text-emerald-900/40 font-black uppercase tracking-widest text-xs">No records found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBill && (
        <BillPreviewModal bill={selectedBill} onClose={() => setSelectedBill(null)} isHistory={true} />
      )}
    </div>
  );
};

export default BillHistory;
