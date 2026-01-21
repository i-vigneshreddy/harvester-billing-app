
import React from 'react';
import { 
  Smartphone, 
  Download, 
  Share2, 
  Star, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  MessageSquare,
  Users,
  Award,
  Globe,
  // Added missing icons to fix "Cannot find name" errors
  LayoutDashboard,
  Zap,
  Coins,
  ArrowRightLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlayStoreView: React.FC = () => {
  const navigate = useNavigate();
  
  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vigneshwara Harvester Billing',
        text: 'Manage your harvester billing professionally with the official Vigneshwara app!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing link: " + window.location.href);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 bg-white min-h-screen lg:rounded-[3rem] lg:shadow-2xl overflow-hidden border border-gray-100">
      {/* Play Store Header Navigation */}
      <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">V</div>
            <span className="font-bold text-gray-700">Google Play</span>
          </div>
        </div>
        <div className="flex space-x-4">
          <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><Info size={20} /></button>
        </div>
      </div>

      {/* Main Listing Section */}
      <div className="p-6 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* App Icon */}
          <div className="w-32 h-32 md:w-48 md:h-48 bg-emerald-600 rounded-[2.5rem] shadow-2xl flex items-center justify-center border-4 border-emerald-50 shrink-0 mx-auto md:mx-0">
             <ShieldCheck size={64} className="text-white md:scale-125" />
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Harvester Billing: Vigneshwara</h1>
              <p className="text-emerald-700 font-bold text-sm mt-1 uppercase tracking-widest">Palwai Mahendher Reddy</p>
              <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">Verified Business</span>
                <span className="text-gray-400 text-xs font-bold">•</span>
                <span className="text-gray-500 text-xs font-bold">Contains ads</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex justify-between items-center py-4 border-y border-gray-50 overflow-x-auto no-scrollbar gap-8">
              <div className="text-center shrink-0">
                <div className="flex items-center justify-center font-bold text-gray-900 text-sm">4.9 <Star size={12} fill="currentColor" className="ml-1" /></div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">1.2K reviews</div>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="text-center shrink-0">
                <div className="font-bold text-gray-900 text-sm">10K+</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Downloads</div>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="text-center shrink-0">
                <div className="flex items-center justify-center font-bold text-gray-900 text-sm">PEGI 3</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Rated for 3+</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => window.location.reload()} className="flex-1 bg-emerald-700 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-800 transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest">
                Install
              </button>
              <button onClick={shareApp} className="px-8 py-3.5 border border-gray-200 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all text-sm uppercase tracking-widest flex items-center justify-center">
                <Share2 size={18} className="mr-2" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Feature Carousel (Mock) */}
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
          <div className="min-w-[280px] h-[160px] bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex flex-col justify-end relative overflow-hidden shrink-0">
            <LayoutDashboard className="absolute top-4 right-4 text-emerald-100" size={80} />
            <h4 className="font-black text-emerald-900 uppercase text-xs tracking-widest relative z-10">Real-time Dashboard</h4>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 relative z-10">Track all harvester revenue live.</p>
          </div>
          <div className="min-w-[280px] h-[160px] bg-blue-50 rounded-2xl border border-blue-100 p-6 flex flex-col justify-end relative overflow-hidden shrink-0">
            <Zap className="absolute top-4 right-4 text-blue-100" size={80} />
            <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest relative z-10">Instant Billing</h4>
            <p className="text-[10px] text-blue-600 font-bold mt-1 relative z-10">Generate bills in 10 seconds.</p>
          </div>
          <div className="min-w-[280px] h-[160px] bg-orange-50 rounded-2xl border border-orange-100 p-6 flex flex-col justify-end relative overflow-hidden shrink-0">
            <Coins className="absolute top-4 right-4 text-orange-100" size={80} />
            <h4 className="font-black text-orange-900 uppercase text-xs tracking-widest relative z-10">G-Pay Integrated</h4>
            <p className="text-[10px] text-orange-600 font-bold mt-1 relative z-10">Secure UPI payments in-app.</p>
          </div>
        </div>

        {/* About the App */}
        <div className="space-y-4 border-b border-gray-50 pb-8">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">About this app</h3>
            <ArrowRightLeft size={16} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            The official enterprise application for Vigneshwara Harvester Solutions. 
            Designed and managed by Palwai Mahendher Reddy, this tool provides agricultural 
            service providers with professional billing, real-time fleet tracking, and 
            digital financial management in remote field conditions.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase">Productivity</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase">Agriculture</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase">Billing</span>
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="space-y-6 pb-8">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Ratings and reviews</h3>
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">See all</span>
          </div>
          <div className="flex items-center space-x-12">
            <div className="text-center">
              <div className="text-5xl font-black text-gray-900 leading-none">4.9</div>
              <div className="flex justify-center my-2 text-emerald-600">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">1,248 ratings</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(num => (
                <div key={num} className="flex items-center space-x-3 text-[10px] font-bold text-gray-500">
                  <span>{num}</span>
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: num === 5 ? '92%' : num === 4 ? '15%' : '2%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Safety Info */}
        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 space-y-4">
           <div className="flex items-center space-x-3">
             <ShieldCheck className="text-emerald-600" size={24} />
             <h4 className="font-bold text-gray-900 text-sm">Data safety</h4>
           </div>
           <p className="text-xs text-gray-500 leading-relaxed">
             Safety starts with understanding how developers collect and share your data. 
             This app uses end-to-end encryption for all financial records and bill proofs.
           </p>
           <button className="text-emerald-700 text-xs font-bold underline">See details</button>
        </div>

        {/* Play Protect Badge */}
        <div className="flex items-center justify-center space-x-3 py-10 opacity-40">
           <CheckCircle2 className="text-gray-400" size={20} />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified by Play Protect</span>
        </div>
      </div>
    </div>
  );
};

export default PlayStoreView;
