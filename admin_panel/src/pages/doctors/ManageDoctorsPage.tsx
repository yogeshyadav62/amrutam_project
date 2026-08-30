import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Building,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { useApiGet, useApiDelete } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import type { Doctor, PaginatedData } from '../../types';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/useDebounce';
import { ConfirmModal } from '../../components/ConfirmModal';
import { DetailModal, type DetailField } from '../../components/DetailModal';

interface Props {
  onOpenAddPage: () => void;
}

export const ManageDoctorsPage: React.FC<Props> = ({ onOpenAddPage }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [viewTarget, setViewTarget] = useState<Doctor | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const queryKey = ['doctors', page, debouncedSearch, specialty];
  const url = `${API_ROUTES.DOCTORS}?page=${page}&pageSize=15&search=${encodeURIComponent(
    debouncedSearch
  )}&specialty=${encodeURIComponent(specialty)}`;

  const { data: resData, isLoading } = useApiGet<{ success: boolean; data: PaginatedData<Doctor> }>(
    queryKey,
    url
  );

  const deleteMutation = useApiDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setDeleteTarget(null);
    },
    onError: () => {
      alert('Failed to delete doctor');
    },
  });

  const doctorsData = resData?.data;
  const doctors = doctorsData?.data || [];
  const totalPages = doctorsData?.totalPages || 1;
  const totalCount = doctorsData?.totalCount || 0;

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(API_ROUTES.DOCTOR_BY_ID(deleteTarget.id));
  };

  const hasActiveFilters = search.trim() !== '' || specialty !== 'All';

  const getDoctorFields = (doc: Doctor): DetailField[] => [
    { label: 'Doctor Name', value: doc.name },
    { label: 'Qualifications', value: doc.degree },
    { label: 'Specialty', value: doc.specialty },
    { label: 'Consultation Fee', value: `₹${doc.consultationFee}` },
    { label: 'Available Consultation Slots', value: Array.isArray(doc.availableSlots) && doc.availableSlots.length > 0 ? doc.availableSlots.join(', ') : 'No slots configured yet' },
    { label: 'Hospital / Facility', value: doc.hospital || 'Amrutam Ayurvedic Clinic' },
    { label: 'Experience', value: `${doc.experienceYears} Years` },
    { label: 'Rating & Reviews', value: `★ ${doc.rating} (${doc.reviewCount} reviews)` },
    { label: 'Availability', value: doc.availableToday ? 'Available Today' : 'Scheduled' },
    { label: 'Biography', value: doc.bio || 'Ayurvedic specialist practitioner.' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Manage Doctors Directory</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
              {totalCount} Doctors
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time doctor records synced directly with MongoDB Atlas database.
          </p>
        </div>

        <button
          onClick={onOpenAddPage}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition">
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </button>
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
            value={specialty}
            onChange={(e) => {
              setSpecialty(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
            <option value="All">All Specialties</option>
            <option value="Kaya Chikitsa (General Medicine)">Kaya Chikitsa (General Medicine)</option>
            <option value="Panchakarma Specialist">Panchakarma Specialist</option>
            <option value="Shalya Tantra (Surgery)">Shalya Tantra (Surgery)</option>
            <option value="Skin & Hair Wellness">Skin & Hair Wellness</option>
            <option value="Digestive & Metabolic Disorders">Digestive & Metabolic Disorders</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setSpecialty('All');
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition whitespace-nowrap">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Data Table View */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 font-bold text-xs">
          Loading doctors table...
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-white">No Doctors Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-3.5 py-3">Doctor Name</th>
                  <th className="px-3.5 py-3">Specialty</th>
                  <th className="px-3.5 py-3">Hospital / Facility</th>
                  <th className="px-3.5 py-3">Exp & Rating</th>
                  <th className="px-3.5 py-3">Fee</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                          <Stethoscope className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 dark:text-white text-xs leading-snug truncate max-w-[150px]">{doc.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[150px]">{doc.degree}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold truncate max-w-[140px]">
                        {doc.specialty}
                      </span>
                    </td>

                    <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[130px] text-[11px]">{doc.hospital || 'Amrutam Clinic'}</span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400 font-black">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {doc.rating}
                        </span>
                        <span className="text-slate-400 font-semibold">
                          ({doc.experienceYears}Y)
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 font-black text-slate-900 dark:text-white text-xs">
                      ₹{doc.consultationFee}
                    </td>

                    <td className="px-3.5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                        doc.availableToday ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {doc.availableToday ? 'Available' : 'Scheduled'}
                      </span>
                    </td>

                    <td className="px-3.5 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => setViewTarget(doc)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition"
                        title="View Doctor Details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(doc)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 transition"
                        title="Delete Doctor">
                        <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Doctor Record"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete Doctor"
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* View Doctor Details Modal */}
      <DetailModal
        isOpen={Boolean(viewTarget)}
        title={viewTarget?.name || 'Doctor Specifications'}
        subtitle={viewTarget?.degree}
        fields={viewTarget ? getDoctorFields(viewTarget) : []}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
};
