import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useApiGet, useApiPatch } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import type { Booking, PaginatedData } from '../../types';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/useDebounce';
import { DetailModal, type DetailField } from '../../components/DetailModal';

export const ManageBookingsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [viewTarget, setViewTarget] = useState<Booking | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const queryKey = ['bookings', page, debouncedSearch, status];
  const url = `${API_ROUTES.BOOKINGS}?page=${page}&pageSize=15&search=${encodeURIComponent(
    debouncedSearch
  )}&status=${encodeURIComponent(status)}`;

  const { data: resData, isLoading } = useApiGet<{ success: boolean; data: PaginatedData<Booking> }>(
    queryKey,
    url
  );

  const statusMutation = useApiPatch<{ success: boolean; data: Booking }, { id: string; status: string }>(
    ({ id }) => API_ROUTES.UPDATE_BOOKING_STATUS(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      },
      onError: () => {
        alert('Failed to update appointment status');
      },
    }
  );

  const payload = resData?.data;
  const bookings = payload?.data || [];
  const totalPages = payload?.totalPages || 1;
  const totalCount = payload?.totalCount || 0;

  const handleStatusChange = (id: string, newStatus: string) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const hasActiveFilters = search.trim() !== '' || status !== 'All';

  const getBookingFields = (bk: Booking): DetailField[] => [
    { label: 'Booking Reference ID', value: bk.id },
    { label: 'Doctor Name', value: bk.doctorName },
    { label: 'Specialty', value: bk.doctorSpecialty },
    { label: 'Consultation Fee', value: `₹${bk.doctorFee}` },
    { label: 'Scheduled Date', value: bk.slotDate },
    { label: 'Slot Time', value: bk.slotTime },
    { label: 'Booking Status', value: bk.status },
    { label: 'Source', value: bk.isOfflineQueued ? 'Synced from Mobile App (Offline Queue)' : 'Live Mobile Video Booking' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Consultation Appointments</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
              {totalCount} Slots
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time appointment schedule, patient video call bookings, and status updates synced with MongoDB.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('All');
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition whitespace-nowrap">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 font-bold text-xs">
          Loading appointment bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
          <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-white">No Consultations Found</h3>
          <p className="text-xs text-slate-400 mt-1">Bookings made in the mobile app will automatically stream here.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-3">Doctor Info</th>
                  <th className="px-3.5 py-3">Slot Date & Time</th>
                  <th className="px-3.5 py-3">Fee Paid</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {bookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-3.5 py-3">
                      <p className="font-black text-slate-900 dark:text-white text-xs truncate max-w-[170px]">{bk.doctorName}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[170px]">{bk.doctorSpecialty}</p>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{bk.slotDate} at {bk.slotTime}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 font-black text-slate-900 dark:text-white text-xs">
                      ₹{bk.doctorFee}
                    </td>
                    <td className="px-3.5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          bk.status === 'Confirmed'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : bk.status === 'Pending'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : 'bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400'
                        }`}>
                        {bk.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3" />}
                        {bk.status === 'Pending' && <AlertCircle className="w-3 h-3" />}
                        {bk.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                        {bk.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => setViewTarget(bk)}
                        className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition"
                        title="View Booking Details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {bk.status !== 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(bk.id, 'Confirmed')}
                          className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition">
                          Approve
                        </button>
                      )}
                      {bk.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleStatusChange(bk.id, 'Cancelled')}
                          className="px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-bold text-[10px] border border-red-500/30 transition">
                          Cancel
                        </button>
                      )}
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
        <div className="flex justify-between items-center pt-4">
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

      {/* View Booking Details Modal */}
      <DetailModal
        isOpen={Boolean(viewTarget)}
        title={viewTarget ? `Appointment Details (${viewTarget.id})` : 'Appointment Details'}
        subtitle={viewTarget?.doctorName}
        fields={viewTarget ? getBookingFields(viewTarget) : []}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
};
