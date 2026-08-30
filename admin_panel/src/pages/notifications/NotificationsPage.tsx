import React, { useState } from 'react';
import {
  BellRing,
  Send,
  CheckCircle2,
  Sparkles,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  History,
  Megaphone,
} from 'lucide-react';
import { useApiGet, useApiPost } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/useDebounce';
import { DetailModal, type DetailField } from '../../components/DetailModal';

export interface PushNotificationLog {
  id: string;
  title: string;
  message: string;
  category: string;
  targetAudience: string;
  sentBy: string;
  status: string;
  sentAt: string;
}

export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'Promotional Offer',
    targetAudience: 'All Users',
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [viewTarget, setViewTarget] = useState<PushNotificationLog | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const queryKey = ['notifications', page, debouncedSearch];
  const url = `${API_ROUTES.NOTIFICATIONS}?page=${page}&pageSize=15&search=${encodeURIComponent(
    debouncedSearch
  )}`;

  const { data: resData, isLoading } = useApiGet<{
    success: boolean;
    data: {
      data: PushNotificationLog[];
      totalCount: number;
      totalPages: number;
    };
  }>(queryKey, url);

  const sendMutation = useApiPost<{ success: boolean; data: PushNotificationLog }, typeof formData>(
    `${API_ROUTES.NOTIFICATIONS}/send`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setSuccessMsg('🎉 Push notification broadcasted successfully via Socket.io & FCM!');
        setFormData({
          title: '',
          message: '',
          category: 'Promotional Offer',
          targetAudience: 'All Users',
        });
        setTimeout(() => setSuccessMsg(''), 4000);
      },
      onError: (err: any) => {
        setErrorMsg(err?.message || 'Failed to broadcast notification');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setErrorMsg('Please enter both Notification Title and Message content.');
      return;
    }
    setErrorMsg('');
    sendMutation.mutate(formData);
  };

  const payload = resData?.data;
  const notifications = payload?.data || [];
  const totalCount = payload?.totalCount || 0;
  const totalPages = payload?.totalPages || 1;

  const getNotificationFields = (n: PushNotificationLog): DetailField[] => [
    { label: 'Notification ID', value: n.id },
    { label: 'Title', value: n.title },
    { label: 'Message Body', value: n.message },
    { label: 'Category', value: n.category },
    { label: 'Target Audience', value: n.targetAudience },
    { label: 'Broadcast Status', value: n.status },
    { label: 'Sent At', value: n.sentAt },
    { label: 'Dispatched By', value: n.sentBy },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header with Section Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Push Notifications & Broadcast Hub</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black">
              Socket.io + FCM
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch instant Push Notifications and real-time WebSocket alerts to mobile users and vaidyas.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'compose'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}>
            <Megaphone className="w-3.5 h-3.5" />
            <span>Compose Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}>
            <History className="w-3.5 h-3.5" />
            <span>Notification History ({totalCount})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Compose Notification Form */}
      {activeTab === 'compose' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Compose Broadcast Push Notification</h3>
              <p className="text-xs text-slate-400">Triggers live WebSockets and Firebase Cloud Messaging</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Notification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🎉 Special 20% OFF on Kuntal Care Hair Malt"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
                    <option value="Promotional Offer">Promotional Offer</option>
                    <option value="Appointment Alert">Appointment Alert</option>
                    <option value="Daily Medicine Reminder">Daily Medicine Reminder</option>
                    <option value="Wellness Tip">Wellness Tip</option>
                    <option value="General Announcement">General Announcement</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
                    <option value="All Users">All Users</option>
                    <option value="Active Patients">Active Patients</option>
                    <option value="Vaidyas & Doctors">Vaidyas & Doctors</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Notification Message Body *</label>
              <textarea
                rows={3}
                required
                placeholder="Enter message details to send to mobile users..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition">
                View History ({totalCount})
              </button>

              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition">
                <Send className="w-4 h-4" />
                <span>{sendMutation.isPending ? 'Broadcasting...' : 'Broadcast Push Notification'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: Notification History Logs Hub */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Banner Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Broadcast Notification History</h3>
                <p className="text-xs text-slate-400">Complete log of dispatched push notifications and socket events</p>
              </div>
            </div>

            {/* Filter Search Bar */}
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notification history..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
              />
              {search.trim() !== '' && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="p-1 text-slate-400 hover:text-red-400 transition">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* History Table */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs">
              Loading notification history...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center bg-slate-900 rounded-3xl border border-slate-800">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Notifications Found</h4>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search filter or broadcast a new message.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Title & Message</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Audience</th>
                      <th className="px-4 py-3">Sent Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                              <BellRing className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 dark:text-white text-xs leading-snug truncate max-w-[240px]">{n.title}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">{n.message}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            {n.category}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {n.targetAudience}
                        </td>

                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {n.sentAt || 'Just Now'}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase border border-emerald-500/20">
                            {n.status || 'Sent'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setViewTarget(n)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition"
                            title="View Details">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-slate-400 font-semibold">
                Showing Page <span className="text-white font-extrabold">{page}</span> of{' '}
                <span className="text-white font-extrabold">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-white px-3 py-1 bg-slate-800 rounded-xl">
                  {page}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Notification Modal */}
      <DetailModal
        isOpen={Boolean(viewTarget)}
        title={viewTarget?.title || 'Notification Broadcast'}
        subtitle={viewTarget?.category}
        fields={viewTarget ? getNotificationFields(viewTarget) : []}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
};
