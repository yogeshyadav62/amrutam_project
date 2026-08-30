import React, { useState } from 'react';
import { ArrowLeft, Plus, Stethoscope } from 'lucide-react';
import { useApiPost } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import type { Doctor } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export const AddDoctorPage: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    degree: '',
    specialty: 'Kaya Chikitsa (General Medicine)',
    experienceYears: '',
    consultationFee: '',
    hospital: '',
    bio: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Doctor name is required');
      return;
    }

    setError('');
    createDoctorMutation.mutate({
      ...formData,
      degree: formData.degree || 'BAMS, MD (Ayurveda)',
      experienceYears: formData.experienceYears ? Number(formData.experienceYears) : 0,
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : 0,
      hospital: formData.hospital || 'Amrutam Clinic',
    } as any);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Add New Doctor / Vaidya</h2>
            <p className="text-xs text-slate-400 mt-0.5">Register practitioner specifications and add directly to MongoDB database</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition">
            Back to Doctors List
          </button>
        </div>
      </div>

      {/* Main Full-Width Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Practitioner Credentials & Details</h3>
            <p className="text-xs text-slate-400">All fields will save directly to MongoDB Atlas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Doctor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Degree & Qualifications</label>
              <input
                type="text"
                placeholder="e.g. BAMS, MD (Ayurveda)"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Specialty</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
                <option value="Kaya Chikitsa (General Medicine)">Kaya Chikitsa (General Medicine)</option>
                <option value="Panchakarma Specialist">Panchakarma Specialist</option>
                <option value="Shalya Tantra (Surgery)">Shalya Tantra (Surgery)</option>
                <option value="Skin & Hair Wellness">Skin & Hair Wellness</option>
                <option value="Digestive & Metabolic Disorders">Digestive & Metabolic Disorders</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Experience (Years)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Consultation Fee (₹)</label>
              <input
                type="number"
                placeholder="e.g. 499"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Hospital / Clinic Facility Name</label>
            <input
              type="text"
              placeholder="e.g. Amrutam Central Hospital, New Delhi"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Doctor Bio & Specializations</label>
            <textarea
              rows={4}
              placeholder="Enter brief professional biography and expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDoctorMutation.isPending}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition">
              <Plus className="w-4 h-4" />
              <span>{createDoctorMutation.isPending ? 'Saving Doctor...' : 'Save & Publish Doctor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
