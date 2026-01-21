
import React from 'react';
import { X, Bell, AlertTriangle, Fuel, CheckCircle2, Info, Clock, Trash2 } from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

interface Props {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<Props> = ({ notifications, onClose, onMarkRead, onClearAll }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.OVERDUE: return <AlertTriangle className="text-red-500" size={18} />;
      case NotificationType.EXPENSE: return <Fuel className="text-orange-500" size={18} />;
      case NotificationType.SUCCESS: return <CheckCircle2 className="text-emerald-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  const getBg = (type: NotificationType, isRead: boolean) => {
    if (isRead) return 'bg-white';
    switch (type) {
      case NotificationType.OVERDUE: return 'bg-red-50/50';
      case NotificationType.EXPENSE: return 'bg-orange-50/50';
      case NotificationType.SUCCESS: return 'bg-emerald-50/50';
      default: return 'bg-blue-50/50';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[100] border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-emerald-900 text-white">
        <div className="flex items-center space-x-3">
          <Bell size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm">Notification Center</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <Bell size={32} />
            </div>
            <p className="font-black text-xs uppercase tracking-widest">Everything's quiet right now</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 transition-all cursor-pointer relative group ${getBg(n.type, n.isRead)}`}
                onClick={() => onMarkRead(n.id)}
              >
                {!n.isRead && (
                  <div className="absolute top-6 right-6 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                )}
                <div className="flex space-x-4">
                  <div className="shrink-0 mt-1">{getIcon(n.type)}</div>
                  <div className="space-y-1 pr-4">
                    <p className={`text-sm font-black ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{n.message}</p>
                    <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">
                      <Clock size={10} className="mr-1" />
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                      {new Date(n.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onClearAll}
            className="w-full flex items-center justify-center space-x-2 py-3 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={14} /> <span>Clear All Alerts</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
