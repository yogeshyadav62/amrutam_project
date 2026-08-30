import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ManageDoctorsPage } from './pages/doctors/ManageDoctorsPage';
import { AddDoctorPage } from './pages/doctors/AddDoctorPage';
import { ManageProductsPage } from './pages/products/ManageProductsPage';
import { AddProductPage } from './pages/products/AddProductPage';
import { ManageBookingsPage } from './pages/bookings/ManageBookingsPage';
import { ManageRecordsPage } from './pages/records/ManageRecordsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { NAV_ROUTES } from './utils/Routes';
import { io } from 'socket.io-client';
import { BellRing, X } from 'lucide-react';

function parseHash(): { tab: string; subView: 'manage' | 'add' } {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('doctors/add')) {
    return { tab: NAV_ROUTES.DOCTORS, subView: 'add' };
  }
  if (hash.startsWith('products/add')) {
    return { tab: NAV_ROUTES.PRODUCTS, subView: 'add' };
  }
  
  const validTabs = [
    NAV_ROUTES.DASHBOARD,
    NAV_ROUTES.DOCTORS,
    NAV_ROUTES.PRODUCTS,
    NAV_ROUTES.BOOKINGS,
    NAV_ROUTES.RECORDS,
    NAV_ROUTES.NOTIFICATIONS,
  ];

  if (validTabs.includes(hash as any)) {
    return { tab: hash, subView: 'manage' };
  }
  return { tab: NAV_ROUTES.DASHBOARD, subView: 'manage' };
}

export function App() {
  const initial = parseHash();
  const [activeTab, setActiveTab] = useState<string>(initial.tab);
  const [subView, setSubView] = useState<'manage' | 'add'>(initial.subView);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastNotif, setToastNotif] = useState<{ title: string; body: string } | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('admin_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('admin_theme', nextTheme);
  };

  useEffect(() => {
    // Synchronize theme class on document element and body
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    // Socket.io Real-time WebSocket connection
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('⚡ Connected to Socket.io real-time server');
    });

    socket.on('push_notification', (data: any) => {
      setToastNotif({ title: data.title, body: data.message });
      setTimeout(() => setToastNotif(null), 5000);
    });

    socket.on('booking_created', (data: any) => {
      setToastNotif({
        title: 'New Consultation Booked 🩺',
        body: `${data.doctorName} scheduled for ${data.slotDate} at ${data.slotTime}`,
      });
      setTimeout(() => setToastNotif(null), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Keep URL hash synchronized on initial load
    const currentHash = subView === 'add' ? `${activeTab}/add` : activeTab;
    if (window.location.hash !== `#${currentHash}`) {
      window.history.replaceState(null, '', `#${currentHash}`);
    }

    const handleHashChange = () => {
      const parsed = parseHash();
      setActiveTab(parsed.tab);
      setSubView(parsed.subView);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navigateTo = (tab: string, sub: 'manage' | 'add' = 'manage') => {
    setActiveTab(tab);
    setSubView(sub);
    const targetHash = sub === 'add' ? `${tab}/add` : tab;
    if (window.location.hash !== `#${targetHash}`) {
      window.history.pushState(null, '', `#${targetHash}`);
    }
  };

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
      {/* Floating Socket.io Live Toast Notification */}
      {toastNotif && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-sm">
          <div className="p-2 rounded-xl bg-white/20">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black truncate">{toastNotif.title}</h4>
            <p className="text-[11px] text-white/90 truncate">{toastNotif.body}</p>
          </div>
          <button onClick={() => setToastNotif(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} subView={subView} onNavigate={navigateTo} theme={theme} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onRefresh={handleRefresh}
          isRefreshing={isSyncing}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === NAV_ROUTES.DASHBOARD && (
            <DashboardPage
              onNavigate={(tab) => navigateTo(tab, 'manage')}
              onOpenDoctorAdd={() => navigateTo(NAV_ROUTES.DOCTORS, 'add')}
              onOpenProductAdd={() => navigateTo(NAV_ROUTES.PRODUCTS, 'add')}
            />
          )}

          {activeTab === NAV_ROUTES.DOCTORS && (
            subView === 'add' ? (
              <AddDoctorPage
                onBack={() => navigateTo(NAV_ROUTES.DOCTORS, 'manage')}
                onSuccess={() => navigateTo(NAV_ROUTES.DOCTORS, 'manage')}
              />
            ) : (
              <ManageDoctorsPage onOpenAddPage={() => navigateTo(NAV_ROUTES.DOCTORS, 'add')} />
            )
          )}

          {activeTab === NAV_ROUTES.PRODUCTS && (
            subView === 'add' ? (
              <AddProductPage
                onBack={() => navigateTo(NAV_ROUTES.PRODUCTS, 'manage')}
                onSuccess={() => navigateTo(NAV_ROUTES.PRODUCTS, 'manage')}
              />
            ) : (
              <ManageProductsPage onOpenAddPage={() => navigateTo(NAV_ROUTES.PRODUCTS, 'add')} />
            )
          )}

          {activeTab === NAV_ROUTES.BOOKINGS && <ManageBookingsPage />}

          {activeTab === NAV_ROUTES.RECORDS && <ManageRecordsPage />}

          {activeTab === NAV_ROUTES.NOTIFICATIONS && <NotificationsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
