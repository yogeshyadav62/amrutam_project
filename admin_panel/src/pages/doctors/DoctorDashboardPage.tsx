import { useState, useEffect } from 'react';
import type { AuthUser, Booking } from '../../types';
import axios from 'axios';
import {
  Calendar,
  Clock,
  CheckCircle,
  IndianRupee,
  UserCheck,
  Plus,
  Trash2,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { API_ROUTES } from '../../utils/Routes';

interface Props {
  user: AuthUser;
}

export function DoctorDashboardPage({ user }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<string[]>(user.availableSlots || []);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSlots, setIsSavingSlots] = useState(false);

  const fetchDoctorData = async () => {
    setIsLoading(true);
    try {
      const bookingsRes = await axios.get(API_ROUTES.DOCTOR_BOOKINGS(user.id));
      if (bookingsRes.data?.success) {
        setBookings(bookingsRes.data.data);
      }

      const docRes = await axios.get(API_ROUTES.DOCTOR_BY_ID(user.id));
      if (docRes.data?.success && Array.isArray(docRes.data.data.availableSlots)) {
        setSlots(docRes.data.data.availableSlots);
      }
    } catch (err) {
      console.warn('Error fetching doctor dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [user.id]);

  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const res = await axios.patch(API_ROUTES.UPDATE_BOOKING_STATUS(bookingId), { status });
      if (res.data?.success) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      }
    } catch (err) {
      console.warn('Error updating status:', err);
    }
  };

  const handleAddSlot = () => {
    const trimmed = newSlotInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!slots.includes(trimmed)) {
      setSlots([...slots, trimmed]);
    }
    setNewSlotInput('');
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    setSlots(slots.filter((s) => s !== slotToRemove));
  };

  const handleSaveSlots = async () => {
    setIsSavingSlots(true);
    try {
      const res = await axios.put(`${API_ROUTES.DOCTORS}/${user.id}/slots`, {
        availableSlots: slots,
      });
      if (res.data?.success) {
        alert('Consultation time slots updated successfully! 🎉');
      }
    } catch (err) {
      console.warn('Error saving slots:', err);
      alert('Failed to save time slots');
    } finally {
      setIsSavingSlots(false);
    }
  };

  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const pendingCount = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Pending').length;
  const totalEarnings = completedCount * (user.consultationFee || 500);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              Doctor Consultation Portal
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-50 mt-2">{user.name}</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {user.degree || 'BAMS'} • {user.specialty || 'Ayurvedic Vaidya'} • {user.hospital || 'Amrutam Clinic'}
          </p>
        </div>

        <button
          onClick={fetchDoctorData}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all self-start md:self-auto">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Dashboard
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consultations</p>
              <h3 className="text-2xl font-black text-slate-50 mt-1">{bookings.length}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Bookings</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earnings</p>
              <h3 className="text-2xl font-black text-slate-50 mt-1">₹{totalEarnings}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Time Slot Configurator */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-50">Manage My Available Time Slots</h3>
            <p className="text-xs text-slate-400 mt-0.5">Configure available consultation hours for patient booking</p>
          </div>
          <button
            onClick={handleSaveSlots}
            disabled={isSavingSlots}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2">
            {isSavingSlots ? 'Saving...' : 'Save Time Slots'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Add custom slot e.g. 01:30 PM"
            value={newSlotInput}
            onChange={(e) => setNewSlotInput(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 flex-1 max-w-sm"
          />
          <button
            onClick={handleAddSlot}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {slots.map((s) => (
            <div
              key={s}
              className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{s}</span>
              <button onClick={() => handleRemoveSlot(s)} className="text-slate-500 hover:text-red-400 ml-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor's Assigned Bookings Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-50">My Patient Consultations</h3>
            <p className="text-xs text-slate-400 mt-0.5">List of patient appointments assigned to {user.name}</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No patient appointments booked yet for your profile.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Info</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-semibold">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="font-extrabold text-slate-100">{b.patientName || 'Patient'}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            {b.patientPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" /> {b.patientPhone}
                              </span>
                            )}
                            {b.patientEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" /> {b.patientEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <p className="font-bold">{b.slotDate}</p>
                      <p className="text-[11px] text-emerald-400 mt-0.5">{b.slotTime}</p>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-200">
                      ₹{b.doctorFee}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          b.status === 'Completed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : b.status === 'Cancelled'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {b.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'Completed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white text-[11px] font-bold transition-all">
                          Mark Completed
                        </button>
                      )}
                      {b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                          className="px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-bold transition-all">
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
