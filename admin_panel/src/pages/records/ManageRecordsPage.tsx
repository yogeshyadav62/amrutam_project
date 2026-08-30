import React, { useState } from 'react';
import {
  FileText,
  Tag,
  Calendar,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useApiGet } from '../../utils/apiCall';
import { API_ROUTES } from '../../utils/Routes';
import type { HealthRecord } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { DetailModal, type DetailField } from '../../components/DetailModal';

export const ManageRecordsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [tag, setTag] = useState('All');
  const [viewTarget, setViewTarget] = useState<HealthRecord | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const queryKey = ['health-records', page, debouncedSearch, type, tag];
  const url = `${API_ROUTES.HEALTH_RECORDS}?page=${page}&pageSize=15&search=${encodeURIComponent(
    debouncedSearch
  )}&type=${encodeURIComponent(type)}&tag=${encodeURIComponent(tag)}`;

  const { data: resData, isLoading } = useApiGet<{
    success: boolean;
    data: {
      groups: { title: string; data: HealthRecord[] }[];
      totalCount: number;
      totalPages: number;
    };
  }>(queryKey, url);

  const payload = resData?.data;
  const groupedRecords = payload?.groups || [];
  const totalCount = payload?.totalCount || 0;
  const totalPages = payload?.totalPages || 1;

  const hasActiveFilters = search.trim() !== '' || type !== 'All' || tag !== 'All';

  const getRecordFields = (rec: HealthRecord): DetailField[] => [
    { label: 'Document Title', value: rec.title },
    { label: 'Record Type', value: rec.type },
    { label: 'Consulting Doctor', value: rec.doctorName || 'Dr. Amrutam Specialist' },
    { label: 'Facility / Hospital', value: rec.facility || 'Amrutam Health Center' },
    { label: 'Date Issued', value: rec.date },
    { label: 'Format & Size', value: `${rec.fileType || 'PDF'} (${rec.fileSize || '1.2 MB'})` },
    { label: 'Medical Tags', value: Array.isArray(rec.tags) ? rec.tags.join(', ') : '#MedicalRecord' },
    { label: 'Clinical Summary', value: rec.summary },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span>Patient Health Records Audit</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            {totalCount} Records
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Audit patient lab reports, Ayurvedic prescriptions, Prakriti charts, and diagnostic records synced from MongoDB.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, doctor name, or summary..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
              <option value="All">All Types</option>
              <option value="Lab Report">Lab Report</option>
              <option value="Prescription">Prescription</option>
              <option value="Consultation">Consultation</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Allergy">Allergy</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition">
              <option value="All">All Tags</option>
              <option value="#Prakriti">#Prakriti</option>
              <option value="#BloodTest">#BloodTest</option>
              <option value="#Skin">#Skin</option>
              <option value="#Panchakarma">#Panchakarma</option>
              <option value="#Digestive">#Digestive</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setType('All');
                setTag('All');
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
          Loading Health Records table...
        </div>
      ) : groupedRecords.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-white">No Health Records Found</h3>
          <p className="text-xs text-slate-400 mt-1">Uploaded medical documents will automatically show here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedRecords.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{group.title}</span>
              </h3>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="px-3.5 py-3">Record Title</th>
                        <th className="px-3.5 py-3">Type</th>
                        <th className="px-3.5 py-3">Doctor / Facility</th>
                        <th className="px-3.5 py-3">Date</th>
                        <th className="px-3.5 py-3">Tags</th>
                        <th className="px-3.5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {group.data.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-slate-900 dark:text-white text-xs leading-snug truncate max-w-[170px]">{rec.title}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">{rec.summary}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3.5 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              {rec.type}
                            </span>
                          </td>

                          <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                            <div className="truncate max-w-[140px] font-bold">{rec.doctorName || 'Dr. Amrutam'}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{rec.facility || 'Amrutam Clinic'}</div>
                          </td>

                          <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                            {rec.date}
                          </td>

                          <td className="px-3.5 py-3">
                            <div className="flex flex-wrap gap-1">
                              {rec.tags.map((t, tid) => (
                                <span key={tid} className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-800">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-3.5 py-3 text-right">
                            <button
                              onClick={() => setViewTarget(rec)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition flex items-center gap-1 text-[10px] font-bold ml-auto"
                              title="View Document Details">
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
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

      {/* View Health Record Details Modal */}
      <DetailModal
        isOpen={Boolean(viewTarget)}
        title={viewTarget?.title || 'Health Record Details'}
        subtitle={viewTarget?.type}
        fields={viewTarget ? getRecordFields(viewTarget) : []}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
};
