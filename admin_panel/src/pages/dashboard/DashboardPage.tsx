import React from 'react';
import {
  Users,
  ShoppingBag,
  CalendarCheck,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
  Leaf,
} from 'lucide-react';
import { useApiGet } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';

interface Props {
  onNavigate: (tab: string) => void;
  onOpenDoctorAdd: () => void;
  onOpenProductAdd: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  onNavigate,
  onOpenDoctorAdd,
  onOpenProductAdd,
}) => {
  const { data: statsRes, isLoading: isStatsLoading } = useApiGet<{
    success: boolean;
    data: { doctorsCount?: number; productsCount?: number; bookingsCount?: number; revenue?: string };
  }>(['stats'], API_ROUTES.STATS);

  const { data: bookingsRes, isLoading: isBookingsLoading } = useApiGet<{
    success: boolean;
    data: Array<{ id: string; doctorName: string; doctorSpecialty?: string; slotDate: string; slotTime: string; status: string }>;
  }>(['recent-bookings'], API_ROUTES.BOOKINGS);

  const statsData = statsRes?.data;
  const rawBookings = bookingsRes?.data;
  const bookingsList: Array<{ id: string; doctorName: string; doctorSpecialty?: string; slotDate: string; slotTime: string; status: string }> =
    Array.isArray(rawBookings)
      ? rawBookings
      : Array.isArray((rawBookings as any)?.data)
      ? (rawBookings as any).data
      : [];

  const stats = [
    {
      title: 'Total Vaidyas & Doctors',
      value: isStatsLoading
        ? '...'
        : statsData?.doctorsCount !== undefined
        ? `${statsData.doctorsCount.toLocaleString()}`
        : '0',
      change: 'Live MongoDB Count',
      icon: Users,
      color: 'bg-blue-50/80 dark:bg-slate-900 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      action: () => onNavigate('doctors'),
    },
    {
      title: 'Ayurvedic Formulations',
      value: isStatsLoading
        ? '...'
        : statsData?.productsCount !== undefined
        ? `${statsData.productsCount.toLocaleString()}`
        : '0',
      change: 'Live Store Items',
      icon: ShoppingBag,
      color: 'bg-emerald-50/80 dark:bg-slate-900 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      action: () => onNavigate('products'),
    },
    {
      title: 'Consultations Booked',
      value: isStatsLoading
        ? '...'
        : statsData?.bookingsCount !== undefined
        ? `${statsData.bookingsCount.toLocaleString()}`
        : '0',
      change: 'Total Appointments',
      icon: CalendarCheck,
      color: 'bg-amber-50/80 dark:bg-slate-900 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      action: () => onNavigate('bookings'),
    },
    {
      title: 'Total Revenue',
      value: isStatsLoading ? '...' : statsData?.revenue || '₹0',
      change: 'Calculated from Bookings',
      icon: TrendingUp,
      color: 'bg-purple-50/80 dark:bg-slate-900 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      action: () => onNavigate('bookings'),
    },
  ];

  const recentActivities = bookingsList.slice(0, 5).map((b, idx) => ({
    id: b.id || idx,
    title: `Consultation Booking (${b.status})`,
    desc: `Appointment for ${b.doctorName} (${b.doctorSpecialty || 'General Ayurvedic'}) scheduled for ${b.slotDate} at ${b.slotTime}`,
    time: 'Live Record',
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
              <Leaf className="w-3.5 h-3.5" />
              <span>Ayurveda & Health Management Portal</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, Super Admin Vaidya
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Manage certified doctors, authentic Ayurvedic formulations, and patient consultation records directly synced with MongoDB Atlas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDoctorAdd}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5">
              <Plus className="w-4 h-4" />
              <span>Add Doctor Page</span>
            </button>
            <button
              onClick={onOpenProductAdd}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-white shadow-xl flex items-center gap-2 transition transform hover:-translate-y-0.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Product Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              onClick={s.action}
              className={`p-6 rounded-3xl ${s.color} border cursor-pointer hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group`}>
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${s.iconBg} border border-current/20`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {s.title}
                </p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{s.value}</h3>
                <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>{s.change}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent System Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live operational events from MongoDB bookings</p>
          </div>
          <button
            onClick={() => onNavigate('bookings')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {isBookingsLoading ? (
            <div className="p-6 text-center text-xs text-slate-400 font-bold">Loading live activities...</div>
          ) : recentActivities.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No consultation bookings recorded yet.</div>
          ) : (
            recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-start gap-4 hover:border-emerald-500/40 transition">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{act.title}</h4>
                    <span className="text-[10px] font-bold text-slate-500">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{act.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
