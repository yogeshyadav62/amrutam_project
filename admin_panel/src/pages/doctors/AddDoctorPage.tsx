import React, { useState } from 'react';
import { ArrowLeft, Plus, Stethoscope, Clock, X, Mail, Lock } from 'lucide-react';
import { useApiPost } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import type { Doctor } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

const QUICK_SUGGESTIONS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:30 PM',
  '02:00 PM',
  '03:30 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
  '08:30 PM',
];

export const AddDoctorPage: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    degree: '',
    specialty: 'Kaya Chikitsa (General Medicine)',
    experienceYears: '',
    consultationFee: '',
    hospital: '',
    bio: '',
  });

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createDoctorMutation = useApiPost<{ success: boolean; data: Doctor }, Partial<Doctor>>(
    API_ROUTES.DOCTORS,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['doctors'] });
        onSuccess();
      },
      onError: (err: any) => {
        setError(err?.message || 'Failed to add doctor');
      },
    }
  );

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleAddCustomTime = () => {
    const trimmed = customTimeInput.trim();
    if (!trimmed) return;
    if (!selectedSlots.includes(trimmed)) {
      setSelectedSlots((prev) => [...prev, trimmed]);
    }
    setCustomTimeInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Doctor name is required');
      return;
    }

    setError('');
    createDoctorMutation.mutate({
      ...formData,
      email: formData.email ? formData.email.toLowerCase().trim() : undefined,
      password: formData.password || 'Doctor@123',
      degree: formData.degree || 'BAMS, MD (Ayurveda)',
      experienceYears: formData.experienceYears ? Number(formData.experienceYears) : 0,
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : 0,
      hospital: formData.hospital || 'Amrutam Clinic',
      availableSlots: selectedSlots,
    } as any);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add New Doctor / Vaidya</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Register practitioner specifications and add login credentials</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition">
            Back to Doctors List
          </button>
        </div>
      </div>

      {/* Main Full-Width Form Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Practitioner Credentials & Custom Schedule</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Doctor specifies login email/password and consultation hours</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Doctor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Degree & Qualifications</label>
              <input
                type="text"
                placeholder="e.g. BAMS, MD (Ayurveda)"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Doctor Portal Login Credentials Section */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Doctor Portal Credentials (ID & Password)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Login Email ID</label>
                <div className="flex items-center px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    placeholder="e.g. dr.rajesh@amrutam.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Login Password (Default: Doctor@123)</label>
                <div className="flex items-center px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Lock className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Doctor@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specialty</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition">
                <option value="Kaya Chikitsa (General Medicine)">Kaya Chikitsa (General Medicine)</option>
                <option value="Panchakarma Specialist">Panchakarma Specialist</option>
                <option value="Shalya Tantra (Surgery)">Shalya Tantra (Surgery)</option>
                <option value="Skin & Hair Wellness">Skin & Hair Wellness</option>
                <option value="Digestive & Metabolic Disorders">Digestive & Metabolic Disorders</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Experience (Years)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Consultation Fee (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hospital / Clinic</label>
              <input
                type="text"
                placeholder="e.g. Amrutam Central Clinic"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Short Biography</label>
              <input
                type="text"
                placeholder="e.g. Experienced Panchakarma specialist..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Time Slot Selection & Custom Slot Creator */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" /> Doctor Consultation Available Time Slots
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select presets or type custom hours (e.g. 08:30 AM)</p>
              </div>

              {/* Custom Time Slot Input Box */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="e.g. 01:15 PM"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition w-32"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTime}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-md shadow-emerald-600/20">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((slot) => {
                  const isSelected = selectedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Active Slots */}
            {selectedSlots.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 space-y-2">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Selected Slots ({selectedSlots.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSlots.map((slot) => (
                    <span
                      key={slot}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      {slot}
                      <button type="button" onClick={() => toggleSlot(slot)} className="hover:opacity-75">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition">
              Cancel
            </button>

            <button
              type="submit"
              disabled={createDoctorMutation.isPending}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center gap-2">
              {createDoctorMutation.isPending ? (
                'Creating Doctor...'
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create Doctor Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
