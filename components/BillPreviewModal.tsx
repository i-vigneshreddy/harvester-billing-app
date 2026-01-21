
import React from 'react';
import { X, Printer, CheckCircle2, Phone, MapPin, Smartphone, Clock, MessageCircle } from 'lucide-react';
import { Bill, AppSettings, Vehicle } from '../types';
import { INITIAL_SETTINGS } from '../constants';

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
  bill: Partial<Bill>;
  onClose: () => void;
  onConfirm?: () => void;
  isHistory?: boolean;
}

const BillPreviewModal: React.FC<Props> = ({ bill, onClose, onConfirm, isHistory = false }) => {
  const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
  const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';
  const settings: AppSettings = JSON.parse(localStorage.getItem(`${userPrefix}settings`) || JSON.stringify(INITIAL_SETTINGS));
  const savedVehicles: Vehicle[] = JSON.parse(localStorage.getItem(`${userPrefix}vehicles`) || '[]');

  const totalDecimalHours = bill.sessions?.reduce((sum, s) => sum + timeToDecimal(s.workTime), 0) || 0;

  const upiId = settings.upiId || 'mplawai@ybl';
  const amount = bill.dueAmount && bill.dueAmount > 0 ? bill.dueAmount.toFixed(2) : '0.00';
  const payeeName = encodeURIComponent(settings.companyName);
  const transactionNote = encodeURIComponent(`Invoice ${bill.id || 'New'}`);
  
  const upiUri = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${transactionNote}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}&bgcolor=ffffff&color=064e3b&margin=10`;

  const handleShareWhatsApp = () => {
    if (!bill.customer?.mobile) {
      alert("Customer mobile number is missing.");
      return;
    }

    const usedVehiclesList = [...new Set(bill.sessions?.map(s => {
      const v = savedVehicles.find(veh => veh.id === s.machineId);
      return v ? `${v.name} [${v.type}]` : 'Harvester';
    }))].filter(Boolean);

    const vehicleText = usedVehiclesList.length > 0 ? usedVehiclesList.join(', ') : 'Harvester';
    const timeStr = formatDecimalToTime(totalDecimalHours);
    
    // Clean minimalist format excluding proprietor details, showing payment method
    const message = 
      `*${settings.companyName.toUpperCase()} - BILL*\n\n` +
      `*Customer:* ${bill.customer?.name || 'Client'}\n` +
      `*Village:* ${bill.customer?.village || '-'}\n` +
      `*Machine:* ${vehicleText}\n` +
      `*Work Done:* ${timeStr}\n\n` +
      `--------------------------\n` +
      `*Total Amount:* Rs ${(bill.totalAmount || 0).toFixed(0)}\n` +
      `*Paid Amount (${bill.paymentType || 'Cash'}):* Rs ${(bill.paidAmount || 0).toFixed(0)}\n` +
      `*BALANCE DUE:* Rs ${(bill.dueAmount || 0).toFixed(0)}\n` +
      `--------------------------\n\n` +
      `*DIRECT PAYMENT LINK:*\n${upiUri}`;

    const whatsappUrl = `https://wa.me/${bill.customer?.mobile?.startsWith('+') ? bill.customer.mobile : '+91' + (bill.customer?.mobile || '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl flex flex-col my-8 animate-in zoom-in duration-200 no-scrollbar overflow-hidden">
        <div className="px-8 py-6 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
               <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Invoice Details</h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">{bill.id || 'NEW ENTRY'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 no-print">
            <button 
              onClick={handleShareWhatsApp} 
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/10"
            >
              <MessageCircle size={16} /> <span>WhatsApp</span>
            </button>
            <button onClick={() => window.print()} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <div id="printable-bill" className="p-10 space-y-10 flex-1 overflow-y-auto bg-white">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-black text-emerald-900 tracking-tighter uppercase leading-none">{settings.companyName}</h1>
            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em]">{settings.description}</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
              <span className="flex items-center"><MapPin size={12} className="mr-1.5 text-emerald-500" /> {settings.address || '-'}</span>
              <span className="flex items-center"><Phone size={12} className="mr-1.5 text-emerald-500"/> {settings.mobile || '-'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 border-y border-gray-100 py-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</h4>
              <div className="space-y-1">
                <p className="text-2xl font-black text-gray-900 tracking-tight">{bill.customer?.name || '-'}</p>
                <p className="text-xs font-bold text-gray-500">{bill.customer?.village || '-'}</p>
                <p className="text-xs font-bold text-gray-400">{bill.customer?.mobile || '-'}</p>
              </div>
            </div>
            <div className="text-right space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</h4>
              <div className="space-y-1">
                <p className="text-sm font-black text-gray-900">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{bill.paymentType || '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] overflow-hidden border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <th className="px-6 py-4">Session Date</th>
                  <th className="px-6 py-4">Vehicle Details</th>
                  <th className="px-6 py-4 text-center">Hours</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bill.sessions?.map((session) => {
                  const vehicle = savedVehicles.find(v => v.id === session.machineId);
                  return (
                    <tr key={session.id} className="text-gray-700">
                      <td className="px-6 py-5 font-black text-gray-900 text-xs">{session.date || '-'}</td>
                      <td className="px-6 py-5">
                        <div className="text-[10px] font-bold text-gray-900 uppercase">
                          {vehicle ? `${vehicle.name} [${vehicle.type}]` : 'Harvester'}
                        </div>
                        <div className="text-[9px] font-medium text-gray-400 uppercase mt-0.5">
                          {vehicle ? vehicle.number : (session.machineId || '-')}
                        </div>
                        {session.agentName && (
                          <div className="text-[9px] font-black text-orange-600 uppercase mt-1">Ref: {session.agentName}</div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-gray-600">{session.workTime}</td>
                      <td className="px-6 py-5 text-right font-black text-gray-900">Rs. {session.totalAmount.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-6 flex-1">
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center space-x-6">
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-emerald-100 shrink-0">
                  <img src={qrCodeUrl} alt="UPI QR" className="w-32 h-32" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center">
                    <Smartphone size={14} className="mr-2" /> Digital Payment
                  </h4>
                  <p className="text-[10px] text-emerald-600 font-bold leading-relaxed">Scan QR to pay using any UPI app.</p>
                  <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-tighter">ID: {upiId}</p>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                * This is a computer-generated invoice for Vigneshwara Harvester Solutions.
              </div>
            </div>

            <div className="w-full md:w-64 space-y-3 pt-4 md:pt-0">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Total Amount</span>
                <span>Rs. {(bill.totalAmount || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Paid ({bill.paymentType || 'Cash'})</span>
                <span className="text-emerald-600">Rs. {(bill.paidAmount || 0).toFixed(0)}</span>
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Balance Due</span>
                <span className="text-2xl font-black text-emerald-900 tracking-tighter">Rs. {(bill.dueAmount || 0).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {!isHistory && onConfirm && (
          <div className="p-8 border-t bg-gray-50 flex justify-end space-x-4 no-print">
            <button onClick={onClose} className="px-8 py-3.5 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-all">Cancel</button>
            <button onClick={onConfirm} className="px-8 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">Save & Finalize</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillPreviewModal;
