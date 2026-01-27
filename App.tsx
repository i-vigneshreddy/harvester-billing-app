
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  History, 
  BarChart3, 
  Truck, 
  Users, 
  UserCircle, 
  Settings as SettingsIcon, 
  PlusCircle, 
  Menu, 
  X, 
  Bell,
  Fuel,
  Contact,
  LogOut,
  Network
} from 'lucide-react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import NewBilling from './views/NewBilling';
import BillHistory from './views/BillHistory';
import Reports from './views/Reports';
import VehicleManagement from './views/VehicleManagement';
import DriverManagement from './views/DriverManagement';
import UserManagement from './views/UserManagement';
import SettingsView from './views/SettingsView';
import Dashboard from './views/Dashboard';
import ExpensesView from './views/ExpensesView';
import AgentsView from './views/AgentsView';
import SiteMap from './views/SiteMap';
import Auth from './views/Auth';
import NotificationCenter from './components/NotificationCenter';
import { INITIAL_SETTINGS } from './constants';
import { AppSettings, User, AppNotification, NotificationType, Bill } from './types';
import { GoogleDriveService } from './GoogleDriveService';

const Sidebar = ({ isOpen, toggle, settings }: { isOpen: boolean, toggle: () => void, settings: AppSettings }) => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'New Billing', icon: PlusCircle, path: '/new-billing' },
    { name: 'Bills History', icon: History, path: '/history' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Daily Expenses', icon: Fuel, path: '/expenses' },
    { name: 'Vehicles', icon: Truck, path: '/vehicles' },
    { name: 'Drivers', icon: UserCircle, path: '/drivers' },
    { name: 'Agents', icon: Contact, path: '/agents' },
    { name: 'User Management', icon: Users, path: '/users' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
    { name: 'Site Map', icon: Network, path: '/sitemap' },
  ];

  const companyDisplay = settings.companyName || 'Harvester Billing';

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggle}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900 dark:bg-emerald-950 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none`}>
        <div className="flex items-center justify-between h-20 px-6 bg-emerald-950 border-b border-emerald-800/30">
          <div className="flex flex-col overflow-hidden">
            <span className="text-lg font-black tracking-tighter uppercase leading-none truncate">
              {companyDisplay}
            </span>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1">Management Suite</span>
          </div>
          <button onClick={toggle} className="lg:hidden p-1 rounded-md hover:bg-emerald-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-6 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)] no-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggle()}
              className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-lg shadow-emerald-900/50' 
                  : 'text-emerald-100/70 hover:bg-emerald-800 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 ${location.pathname === item.path ? 'text-white' : 'text-emerald-400'}`} size={20} />
              <span className="font-bold text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 text-[10px] text-emerald-400/50 bg-emerald-950/50 text-center font-bold uppercase tracking-widest border-t border-emerald-800/30 truncate">
          Owner: {settings.ownerName || 'Not Set'}
        </div>
      </aside>
    </>
  );
};

const Header = ({ 
  toggleSidebar, 
  settings, 
  user, 
  onLogout, 
  notificationCount, 
  onOpenNotifications 
}: { 
  toggleSidebar: () => void, 
  settings: AppSettings, 
  user: User | null, 
  onLogout: () => void,
  notificationCount: number,
  onOpenNotifications: () => void
}) => {
  return (
    <header className="h-16 bg-white dark:bg-[#111a15] border-b border-gray-100 dark:border-emerald-900/30 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center max-w-[50%]">
        <button 
          onClick={toggleSidebar} 
          className="p-2 mr-4 lg:hidden rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex flex-col overflow-hidden">
          <h1 className="text-base lg:text-lg font-black text-gray-800 dark:text-gray-100 leading-none truncate">{settings.companyName || 'Enterprise Billing'}</h1>
          <p className="text-[10px] text-gray-400 dark:text-emerald-500/70 font-bold uppercase tracking-widest mt-1 truncate">{settings.description || 'System Details Not Configured'}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={onOpenNotifications}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full relative transition-all"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-[#111a15] flex items-center justify-center text-[8px] font-black text-white">
              {notificationCount}
            </span>
          )}
        </button>
        
        <div className="flex items-center space-x-3 border-l border-gray-100 dark:border-emerald-900/30 pl-4 ml-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-black text-gray-900 dark:text-gray-100 leading-tight">@{user?.userId}</span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Admin</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black shadow-sm border border-emerald-200 dark:border-emerald-800/50">
            {user?.userId?.charAt(0).toUpperCase() || 'A'}
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLogout();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-all font-black text-xs shadow-md active:scale-95 ml-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline tracking-tighter">SIGN OUT</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.title = settings.companyName 
      ? `${settings.companyName} - Harvester Billing` 
      : 'Harvester Billing System';
  }, [settings.theme, settings.companyName]);

  const userPrefix = currentUser ? `u_${currentUser.id}_` : 'harvester_';

  const addNotification = useCallback((notif: Partial<AppNotification>) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title: notif.title || 'Alert',
      message: notif.message || '',
      type: notif.type || NotificationType.SYSTEM,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notif
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem(`${userPrefix}notifications`, JSON.stringify(updated));
      return updated;
    });

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(newNotif.title, { body: newNotif.message });
    }
  }, [userPrefix]);

  const markRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem(`${userPrefix}notifications`, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem(`${userPrefix}notifications`);
  };

  useEffect(() => {
    if (!currentUser) return;

    const runChecks = () => {
      const bills: Bill[] = JSON.parse(localStorage.getItem(`${userPrefix}bills`) || '[]');
      const storedNotifs: AppNotification[] = JSON.parse(localStorage.getItem(`${userPrefix}notifications`) || '[]');
      const now = new Date();
      
      bills.forEach(bill => {
        if (bill.dueAmount > 0) {
          const createdAt = new Date(bill.createdAt);
          const diffDays = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 3) {
            const alreadyNotified = storedNotifs.some(n => n.title.includes(bill.customer.name) && n.type === NotificationType.OVERDUE);
            if (!alreadyNotified) {
              addNotification({
                title: `Overdue: ${bill.customer.name}`,
                message: `Bill of ₹${bill.dueAmount} is pending for ${diffDays} days. Contact ${bill.customer.mobile}.`,
                type: NotificationType.OVERDUE
              });
            }
          }
        }
      });
    };

    runChecks();
    const interval = setInterval(runChecks, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser, userPrefix, addNotification]);

  useEffect(() => {
    const session = localStorage.getItem('harvester_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        setCurrentUser(user);
        const prefix = user.id ? `u_${user.id}_` : 'harvester_';
        
        const savedSettings = localStorage.getItem(`${prefix}settings`);
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        const savedNotifs = localStorage.getItem(`${prefix}notifications`);
        if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

        if ("Notification" in window && Notification.permission !== "granted") {
          Notification.requestPermission();
        }
      } catch (e) {
        localStorage.removeItem('harvester_session');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('harvester_session', JSON.stringify(user));
    const prefix = user.id ? `u_${user.id}_` : 'harvester_';
    const savedSettings = localStorage.getItem(`${prefix}settings`);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    else setSettings(INITIAL_SETTINGS);

    const savedNotifs = localStorage.getItem(`${prefix}notifications`);
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    if (GoogleDriveService.isConnected()) {
      GoogleDriveService.syncUsers(user.id);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out? Your session will be terminated.")) {
      localStorage.removeItem('harvester_session');
      setCurrentUser(null);
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">Loading Enterprise Suite...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Router>
      <div className="min-h-screen flex bg-gray-50 dark:bg-[#0a0f0d] font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} settings={settings} />
        
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-64">
          <Header 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            settings={settings} 
            user={currentUser} 
            onLogout={handleLogout} 
            notificationCount={unreadCount}
            onOpenNotifications={() => setIsNotifOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-billing" element={<NewBilling onNewNotification={addNotification} />} />
              <Route path="/history" element={<BillHistory />} />
              <Route path="/reports" element={<Reports settings={settings} />} />
              <Route path="/expenses" element={<ExpensesView onNewNotification={addNotification} />} />
              <Route path="/vehicles" element={<VehicleManagement />} />
              <Route path="/drivers" element={<DriverManagement />} />
              <Route path="/agents" element={<AgentsView />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<SettingsView settings={settings} onUpdate={setSettings} />} />
              <Route path="/sitemap" element={<SiteMap settings={settings} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {isNotifOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]" onClick={() => setIsNotifOpen(false)} />
            <NotificationCenter 
              notifications={notifications} 
              onClose={() => setIsNotifOpen(false)} 
              onMarkRead={markRead}
              onClearAll={clearAllNotifications}
            />
          </>
        )}
      </div>
    </Router>
  );
}
