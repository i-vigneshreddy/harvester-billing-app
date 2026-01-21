
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Camera, MessageCircle, Save, UserCircle, Eye, RefreshCcw, Smartphone, User, X, Share2, Send, Info, Clock, QrCode } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Customer, WorkingSession, Bill, PaymentType, Vehicle, Agent, AppSettings, NotificationType, AppNotification, VehicleType } from '../types';
import { INITIAL_SETTINGS } from '../constants';
import BillPreviewModal from '../components/BillPreviewModal';

const timeToDecimal = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) + (minutes || 0) / 60;
};

const formatDecimalToTime = (decimalHours: number): string => {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  return `${h}h ${m}m`;
};

interface Props {
  onNewNotification?: (notif: Partial<AppNotification>) => void;
}

const NewBilling: React.FC<Props> = ({ onNewNotification }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Partial<Customer>>({ name: '', mobile: '', village: '' });
  const [sessions, setSessions] = useState<WorkingSession[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [showImageZoom, setShowImageZoom] = useState<string | null>(null);

  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';
  const settings: AppSettings = JSON.parse(localStorage.getItem(`${userPrefix}settings`) || JSON.stringify(INITIAL_SETTINGS));

  useEffect(() => {
    const savedVehicles = JSON.parse(localStorage.getItem(`${userPrefix}vehicles`) || '[]');
    const savedAgents = JSON.parse(localStorage.getItem(`${userPrefix}agents`) || '[]');
    setVehicles(savedVehicles);
    setAgents(savedAgents);

    if (location.state?.editBill) {
      const b = location.state.editBill as Bill;
      setEditingBillId(b.id);
      setCustomer(b.customer);
      setSessions(b.sessions);
      setPaidAmount(b.paidAmount);
      setPaymentType(b.paymentType);
      window.history.replaceState({}, document.title);
    }
  }, [location, userPrefix]);

  const addSession = () => {
    const newSession: WorkingSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      workTime: '00:00',
      standardRate: 2000,
      totalAmount: 0,
      machineId: vehicles[0]?.id || '',
      agentCommission: 0
    };
    setSessions([...sessions, newSession]);
  };

  const calculateCommission = (agentId: string | undefined, machineId: string, hours: number): number => {
    if (!agentId) return 0;
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return 0;
    const vehicle = vehicles.find(v => v.id === machineId);
    if (!vehicle) return 0;
    const ratePerHour = agent.vehicleCommissions[vehicle.type] || 0;
    return hours * ratePerHour;
  };

  const formatTimeInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    return cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
  };

  const updateSession = (id: string, updates: Partial<WorkingSession>) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        const decimalHours = timeToDecimal(updated.workTime);
        updated.totalAmount = decimalHours * (updated.standardRate);
        
        if (updated.agentId) {
          const agent = agents.find(a => a.id === updated.agentId);
          if (agent) {
            updated.agentName = agent.name;
            updated.agentCommission = calculateCommission(updated.agentId, updated.machineId, decimalHours);
          }
        } else {
          updated.agentCommission = 0;
          updated.agentName = '';
        }
        return updated;
      }
      return s;
    }));
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSession(id, { billCopyUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCustomer({ name: '', mobile: '', village: '' });
    setSessions([]);
    setPaidAmount(0);
    setEditingBillId(null);
    setPaymentType(PaymentType.CASH);
  };

  const totalBillAmount = sessions.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalDecimalHours = sessions.reduce((sum, s) => sum + timeToDecimal(s.workTime), 0);
  const dueAmount = totalBillAmount - paidAmount;

  const constructShareMessage = (isSMS = false) => {
    const amountToPay = dueAmount > 0 ? dueAmount : totalBillAmount;
    const upiId = settings.upiId || 'mplawai@ybl';
    const company = settings.companyName || 'Vigneshwara Harvester';
    const billRef = editingBillId || `INV-${new Date().getTime().toString().slice(-6)}`;
    const formattedTotalHours = formatDecimalToTime(totalDecimalHours);

    const usedVehiclesList = [...new Set(sessions.map(s => {
      const v = vehicles.find(veh => veh.id === s.machineId);
      return v ? `${v.name} [${v.type}]` : 'Harvester';
    }))].filter(Boolean);

    const vehicleText = usedVehiclesList.length > 0 ? usedVehiclesList.join(', ') : 'Harvester';
    
    // For SMS, we keep the UPI link minimal to save characters
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(company)}&am=${amountToPay.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill ' + billRef)}`;
    
    if (isSMS) {
      // Ultra-compact SMS format to stay close to 160-character limit
      return `${company.toUpperCase()}\n` +
             `Mob: ${customer.mobile || '-'}\n` +
             `Mach: ${vehicleText}\n` +
             `Work: ${formattedTotalHours}\n` +
             `Amt: ₹${totalBillAmount.toFixed(0)}\n` +
             `Pd(${paymentType}): ₹${paidAmount.toFixed(0)}\n` +
             `Bal: ₹${dueAmount.toFixed(0)}\n` +
             `${upiUri}`;
    } else {
      // Clean, minimalist WhatsApp format
      return `*${company.toUpperCase()} - BILL SUMMARY*\n\n` +
             `*Customer:* ${customer.name || 'Client'}\n` +
             `*Village:* ${customer.village || '-'}\n` +
             `*Machine:* ${vehicleText}\n` +
             `*Duration:* ${formattedTotalHours}\n\n` +
             `--------------------------\n` +
             `*Total Amount:* Rs ${totalBillAmount.toFixed(0)}\n` +
             `*Paid Amount (${paymentType}):* Rs ${paidAmount.toFixed(0)}\n` +
             `*BALANCE DUE:* Rs ${dueAmount.toFixed(0)}\n` +
             `--------------------------\n\n` +
             `*DIRECT PAYMENT LINK:*\n${upiUri}`;
    }
  };

  const handleShareWhatsApp = () => {
    if (!customer.mobile) {
      alert("Please enter customer mobile number first.");
      return;
    }
    const message = constructShareMessage(false);
    const whatsappUrl = `https://wa.me/${customer.mobile.startsWith('+') ? customer.mobile : '+91' + customer.mobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareSMS = () => {
    if (!customer.mobile) {
      alert("Please enter customer mobile number first.");
      return;
    }
    const message = constructShareMessage(true);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const smsUrl = `sms:${customer.mobile}${isIOS ? '&' : '?'}body=${encodeURIComponent(message)}`;
    
    window.location.href = smsUrl;
  };

  const saveBill = () => {
    if (!customer.name || !customer.mobile || sessions.length === 0) {
      alert("Please fill in customer details and add sessions.");
      return;
    }
    const billToSave: Bill = {
      id: editingBillId || 'BILL-' + Date.now(),
      customer: customer as Customer,
      sessions,
      totalAmount: totalBillAmount,
      paidAmount,
      dueAmount,
      paymentType,
      createdAt: new Date().toISOString()
    };
    const existingBills: Bill[] = JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]');
    let updatedBills: Bill[];
    if (editingBillId) {
      updatedBills = existingBills.map(b => b.id === editingBillId ? billToSave : b);
    } else {
      updatedBills = [...existingBills, billToSave];
    }
    localStorage.setItem(`${userPrefix}bills`, JSON.stringify(updatedBills));

    if (onNewNotification) {
      if (dueAmount > 0) {
        onNewNotification({
          title: 'Outstanding Due Recorded',
          message: `Bill for ${customer.name} saved. Balance: Rs. ${dueAmount.toFixed(0)}`,
          type: NotificationType.OVERDUE
        });
      } else {
        onNewNotification({
          title: 'Full Payment Logged',
          message: `Bill for ${customer.name} fully settled.`,
          type: NotificationType.SUCCESS
        });
      }
    }

    alert("Bill saved successfully!");
    resetForm();
    navigate('/history');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-40 px-2 sm:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight uppercase px-2">Harvester Billing Center</h2>
        <div className="flex flex-wrap gap-2 px-2">
          {editingBillId && <button onClick={resetForm} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-bold flex items-center transition-all hover:bg-red-100 shadow-sm text-xs"><RefreshCcw size={14} className="mr-2"/> Reset Form</button>}
          <button onClick={() => setShowPreviewModal(true)} className="bg-white dark:bg-[#121a16] border border-gray-100 dark:border-emerald-900/20 text-gray-700 dark:text-emerald-100 px-4 py-2 rounded-xl font-bold flex items-center shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-emerald-900/10 text-xs"><Eye size={14} className="mr-2 text-emerald-600" /> View Invoice</button>
        </div>
      </div>

      <section className="bg-white dark:bg-[#121a16] p-5 rounded-[2rem] shadow-xl border border-gray-50 dark:border-emerald-900/20">
        <h3 className="text-sm font-black mb-6 text-emerald-800 dark:text-emerald-400 flex items-center uppercase tracking-widest">
          <UserCircle size={18} className="mr-2 text-emerald-600" /> Customer Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/50 uppercase tracking-widest ml-1">Customer Name</label>
            <input type="text" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} className="w-full p-3.5 border border-gray-100 dark:border-emerald-900/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 bg-gray-50/30 dark:bg-[#1a2e26]" placeholder="Name" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/50 uppercase tracking-widest ml-1">Mobile No</label>
            <input type="tel" value={customer.mobile} onChange={(e) => setCustomer({...customer, mobile: e.target.value})} className="w-full p-3.5 border border-gray-100 dark:border-emerald-900/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 bg-gray-50/30 dark:bg-[#1a2e26]" placeholder="Contact" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/50 uppercase tracking-widest ml-1">Village</label>
            <input type="text" value={customer.village} onChange={(e) => setCustomer({...customer, village: e.target.value})} className="w-full p-3.5 border border-gray-100 dark:border-emerald-900/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800 dark:text-emerald-50 bg-gray-50/30 dark:bg-[#1a2e26]" placeholder="Location" />
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#121a16] p-5 rounded-[2rem] shadow-xl border border-gray-50 dark:border-emerald-900/20">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50 dark:border-emerald-900/10">
          <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Harvesting Sessions</h3>
        </div>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="p-4 bg-gray-50/30 dark:bg-[#1a2e26] rounded-3xl border border-gray-100 dark:border-emerald-900/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-3 relative group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all shadow-sm">
              <button onClick={() => removeSession(session.id)} className="absolute -top-2 -right-2 p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 shadow-md border border-red-50 dark:border-red-900/30 z-10"><Trash2 size={14}/></button>
              
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-tighter">Date</label>
                <input type="date" value={session.date} onChange={(e) => updateSession(session.id, { date: e.target.value })} className="w-full p-2 border border-gray-100 dark:border-emerald-900/10 rounded-xl text-xs font-bold dark:bg-emerald-950 dark:text-white" />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-tighter">Hours</label>
                <input type="text" placeholder="HH:MM" maxLength={5} value={session.workTime} onChange={(e) => updateSession(session.id, { workTime: formatTimeInput(e.target.value) })} className="w-full p-2 border border-gray-100 dark:border-emerald-900/10 rounded-xl text-xs font-bold dark:bg-emerald-950 dark:text-white" />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-tighter">Rate/Hr</label>
                <input type="number" value={session.standardRate} onChange={(e) => updateSession(session.id, { standardRate: Number(e.target.value) })} className="w-full p-2 border border-gray-100 dark:border-emerald-900/10 rounded-xl text-xs font-bold dark:bg-emerald-950 dark:text-white" />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-tighter">Machine</label>
                <select value={session.machineId} onChange={(e) => updateSession(session.id, { machineId: e.target.value })} className="w-full p-2 border border-gray-100 dark:border-emerald-900/10 rounded-xl text-xs font-bold dark:bg-emerald-950 dark:text-white">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-tighter">Agent</label>
                <select value={session.agentId || ''} onChange={(e) => updateSession(session.id, { agentId: e.target.value })} className="w-full p-2 border border-gray-100 dark:border-emerald-900/10 rounded-xl text-xs font-bold text-orange-700 dark:text-orange-300 dark:bg-emerald-950">
                  <option value="">None</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-orange-400 uppercase tracking-tighter">Comm.</label>
                <div className="font-black pt-1 text-orange-600 dark:text-orange-400 text-xs">Rs. {session.agentCommission?.toFixed(0) || 0}</div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-emerald-500/40 uppercase tracking-tighter">Amount</label>
                <div className="font-black pt-1 text-emerald-800 dark:text-emerald-400 text-xs">Rs. {session.totalAmount.toFixed(0)}</div>
              </div>

              <div className="flex items-end space-x-1">
                <label className="flex-1 cursor-pointer bg-white dark:bg-emerald-900/20 border border-gray-100 dark:border-emerald-900/20 p-2 rounded-xl text-[9px] font-black uppercase flex items-center hover:bg-gray-50 dark:hover:bg-emerald-900/40 justify-center transition-all text-gray-500 dark:text-emerald-100 shadow-sm">
                   <Camera size={12} className="mr-1.5 text-emerald-600" /> Bill
                   <input type="file" accept="image/*" onChange={(e) => handleImageUpload(session.id, e)} className="hidden" />
                </label>
                {session.billCopyUrl && (
                  <button onClick={() => setShowImageZoom(session.billCopyUrl!)} className="p-2 bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800 shadow-sm">
                    <Eye size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-10 text-gray-300 dark:text-emerald-900/50 italic border-2 border-dashed border-gray-50 dark:border-emerald-900/10 rounded-3xl">
              <User size={32} className="mx-auto mb-2 opacity-10" />
              <p className="font-black uppercase tracking-widest text-[9px]">Tap "Add Session" to record field work</p>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
           <button onClick={addSession} className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 uppercase tracking-widest text-xs">
             <Plus size={16} className="mr-2"/> Add Session
           </button>
        </div>
      </section>

      <section className="bg-white dark:bg-[#121a16] p-6 rounded-[2rem] shadow-xl border border-gray-50 dark:border-emerald-900/20">
        <h3 className="text-sm font-black mb-6 text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Financial Settlement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/50 uppercase tracking-widest mb-3 ml-1">Payment Type</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(PaymentType).map(pt => (
                  <button key={pt} onClick={() => setPaymentType(pt as any)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest ${paymentType === pt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-[#1a2e26] text-gray-400 dark:text-emerald-500/50 border-gray-100 dark:border-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-700'}`}>{pt}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-emerald-500/50 uppercase tracking-widest mb-1 ml-1">Paid Amount (Rs.)</label>
              <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} className="w-full p-4 border border-gray-100 dark:border-emerald-900/20 rounded-2xl text-2xl font-black bg-gray-50/20 dark:bg-[#1a2e26] focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700 dark:text-emerald-400 placeholder-emerald-900/20" placeholder="0" />
            </div>
          </div>
          <div className="bg-emerald-950 p-8 rounded-[2rem] text-white flex flex-col justify-center shadow-2xl relative overflow-hidden border border-emerald-800/30">
            <div className="flex justify-between items-center opacity-40 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              <span>Gross Total</span>
              <span>Rs. {totalBillAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center opacity-40 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
              <span>Work Duration</span>
              <span className="flex items-center"><Clock size={10} className="mr-1" /> {formatDecimalToTime(totalDecimalHours)}</span>
            </div>
            <div className="border-t border-white/5 pt-6">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-[0.2em] block mb-1">Outstanding Balance</span>
              <span className={`text-4xl font-black tracking-tighter ${dueAmount > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>Rs. {dueAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#121a16] p-6 rounded-[2rem] shadow-xl border border-gray-50 dark:border-emerald-900/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Digital Bill Sharing</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center space-x-3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs border border-emerald-400/20"
          >
            <MessageCircle size={18} />
            <span>Share via WhatsApp</span>
          </button>
          <button 
            onClick={handleShareSMS}
            className="flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs border border-blue-400/20"
          >
            <Send size={18} />
            <span>Share via SMS</span>
          </button>
        </div>
        <div className="mt-4 flex flex-col items-center space-y-2">
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/50 font-bold uppercase tracking-widest text-center">
            Sharing sends a minimalist bill summary with a direct UPI payment link. SMS format is optimized for device limits.
          </p>
        </div>
      </section>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40">
        <button onClick={saveBill} className="w-full flex items-center justify-center space-x-4 bg-emerald-600 text-white py-5 rounded-2xl shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all text-lg font-black uppercase tracking-widest border border-emerald-400/20">
          <Save size={20} /> <span>FINALIZE & SAVE BILL</span>
        </button>
      </div>

      {showPreviewModal && <BillPreviewModal bill={{ customer: customer as Customer, sessions, totalAmount: totalBillAmount, paidAmount, dueAmount, paymentType }} onClose={() => setShowPreviewModal(false)} onConfirm={saveBill} />}

      {showImageZoom && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in" onClick={() => setShowImageZoom(null)}>
          <div className="relative max-w-full max-h-full p-2 bg-white rounded-3xl shadow-2xl animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <img src={showImageZoom} alt="Bill Copy" className="max-h-[80vh] rounded-2xl" />
            <button onClick={() => setShowImageZoom(null)} className="absolute -top-10 right-0 text-white font-black text-xs uppercase flex items-center"><X size={18} className="mr-1" /> Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewBilling;
