import { useState, useEffect } from 'react';
import type { AuthUser, Booking } from '../../types';
import axios from 'axios';
import {
  CalendarCheck,
  Search,
  Clock,
  UserCheck,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

interface Props {
  user: AuthUser;
}

export function DoctorBookingsPage({ user }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/doctors/${user.id}/bookings`);
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching doctor bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, { status });
      if (res.data?.success) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      }
    } catch (err) {
      console.warn('Error updating booking status:', err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.patientPhone || '').includes(search) ||
      (b.patientEmail || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              Doctor Appointments
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">My Patient Consultations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage scheduled patient bookings for {user.name}
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full md:w-auto">
          {(['All', 'Confirmed', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                statusFilter === tab
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}>
              {tab === 'Confirmed' ? 'Pending' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none w-full"
          />
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">
            <span className="inline-block animate-spin border-2 border-emerald-500 border-t-transparent rounded-full w-6 h-6 mb-2" />
            <p>Loading patient consultations...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">
            <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
            No consultation appointments found for this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Info</th>
                  <th className="py-3 px-4">Date & Time Slot</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-semibold">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">{b.patientName || 'Guest Patient'}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {b.patientPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" /> {b.patientPhone}
                              </span>
                            )}
                            {b.patientEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" /> {b.patientEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                      <p className="font-black">{b.slotDate}</p>
                      <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {b.slotTime}
                      </p>
                    </td>

                    <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                      ₹{b.doctorFee}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          b.status === 'Completed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            : b.status === 'Cancelled'
                            ? 'bg-red-500/10 border-red-500/30 text-red-500'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right space-x-2">
                      {b.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'Completed')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-extrabold transition">
                          Mark Completed
                        </button>
                      )}
                      {b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                          className="px-3.5 py-2 rounded-xl bg-red-600/10 border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-extrabold transition">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
