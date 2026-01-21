
import React from 'react';
import { 
  Network, 
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Briefcase, 
  Printer, 
  ArrowRightLeft, 
  Zap, 
  Coins, 
  Settings,
  Truck,
  UserCheck
} from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
}

const SiteMap: React.FC<Props> = ({ settings }) => {
  const sections = [
    {
      title: "1. Core Operations (Billing Flow)",
      icon: LayoutDashboard,
      color: "text-emerald-600",
      items: [
        "Customer Registry (Name, Mobile, Village)",
        "Work Session Entry (Date, HH:MM, Rate/Hr)",
        "Machine-Session Attribution (Fleet Link)",
        "Agent/Broker Commission Auto-Calculations",
        "Document Evidence (Bill Copy Photo Upload)",
        "Invoice Preview & Live Editing"
      ]
    },
    {
      title: "2. Financial Fluids (Money Flow)",
      icon: Coins,
      color: "text-orange-600",
      items: [
        "Payment Settlements (Cash, PhonePe, G-Pay)",
        "Dynamic UPI QR Code Generation",
        "Balance Due / Credit Tracking",
        "Daily Operational Expenses (Diesel/Food/Toll)",
        "Agent Earning Ledgers (Broker Payouts)",
        "Net Profit/Loss Performance Analytics"
      ]
    },
    {
      title: "3. Fleet & Staff (Resource Flow)",
      icon: Truck,
      color: "text-blue-600",
      items: [
        "Machine Inventory (Type/Number Tracking)",
        "Vehicle-wise Revenue Performance",
        "Driver Employment Registry",
        "Driver Salary & Advance Ledger",
        "Staff Payment History Logs"
      ]
    },
    {
      title: "4. System Governance (Admin Flow)",
      icon: Shield,
      color: "text-purple-600",
      items: [
        "Multi-User Access Control (Signup Registry)",
        "Enterprise Branding Settings",
        "Data Backup & JSON Export",
        "Bill Archives & Search History",
        "Secure Session Termination"
      ]
    }
  ];

  const workflows = [
    { name: "The Revenue Fluid", flow: "Field Work → Session Entry → Bill Generation → Payment Collection → Balance Update" },
    { name: "The Expense Fluid", flow: "Operational Cost (Diesel/Repair) → Expense Entry → Deducted from Gross Revenue" },
    { name: "The Commission Fluid", flow: "Broker Referral → Linked Session → Rate Calculation → Agent Ledger Update" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 print:pb-0">
      <div className="flex justify-between items-center px-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase flex items-center">
            <Network className="mr-3 text-emerald-600" size={32} /> System Architecture
          </h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Full Site Map & Operational Fluids</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Printer size={18} /> <span>Print Document</span>
        </button>
      </div>

      <div id="printable-bill" className="space-y-10 print:space-y-6">
        <div className="text-center space-y-2 border-b-4 border-emerald-600 pb-8">
          <h1 className="text-4xl font-black text-emerald-900 tracking-tighter uppercase">{settings.companyName || 'Enterprise Harvester'}</h1>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-[0.4em]">Official System Site Map</p>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">OWNER: {settings.ownerName || 'NOT SET'}</p>
        </div>

        <section className="bg-emerald-50/50 p-8 rounded-[3rem] border border-emerald-100 print:border-gray-200">
           <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight flex items-center mb-6">
             <Zap className="mr-2 text-emerald-600" size={24} /> System Operational Fluids (Workflows)
           </h3>
           <div className="space-y-4">
             {workflows.map((wf, idx) => (
               <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col md:flex-row md:items-center gap-4">
                 <div className="w-full md:w-1/4">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Process Name</span>
                   <span className="font-black text-gray-800 text-sm uppercase">{wf.name}</span>
                 </div>
                 <div className="flex-1 flex items-center text-xs font-bold text-gray-500">
                    <ArrowRightLeft className="mr-3 text-emerald-400 shrink-0" size={16} />
                    <span>{wf.flow}</span>
                 </div>
               </div>
             ))}
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 relative overflow-hidden group">
              <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-gray-50">
                <div className={`p-4 rounded-3xl bg-gray-50 ${section.color}`}>
                  <section.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">{section.title}</h3>
              </div>

              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center text-gray-600 font-bold group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={18} className="text-emerald-400 mr-2 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-950 p-12 rounded-[3.5rem] text-white shadow-2xl mx-2 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
           <div className="space-y-2">
              <h4 className="text-2xl font-black uppercase tracking-tighter">Enterprise Verification</h4>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em]">Software for: {settings.companyName || 'New Entity'}</p>
           </div>
           <div className="flex flex-col items-center md:items-end">
              <div className="w-48 h-px bg-emerald-800 mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/50">Authorized: {settings.ownerName || 'Proprietor'}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMap;
