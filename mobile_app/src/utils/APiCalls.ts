import axios from 'axios';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

// ==================== Domain Interfaces & Types ====================

export interface Doctor {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  availableToday: boolean;
  nextAvailableSlot: string;
  availableSlots?: string[];
  bio: string;
  hospital: string;
  languages: string[];
}

export interface Slot {
  id: string;
  time: string;
  date: string;
  isBooked: boolean;
  isExpired: boolean;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  size: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  badge: string;
  inStock: boolean;
  stockQuantity: number;
  description: string;
  ingredients: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type RecordType = 'Lab Report' | 'Prescription' | 'Consultation' | 'Vaccination' | 'Allergy';

export interface HealthRecord {
  id: string;
  title: string;
  type: RecordType;
  doctorName: string;
  facility: string;
  date: string;
  monthYear: string;
  tags: string[];
  summary: string;
  fileType: 'PDF' | 'IMAGE';
  fileSize: string;
}

export interface GroupedHealthRecords {
  title: string;
  data: HealthRecord[];
}

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorFee: number;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  slotId: string;
  slotTime: string;
  slotDate: string;
  createdAt: string;
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';
  isOfflineQueued?: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

// ==================== Generic HTTP TanStack Query Hooks ====================

// Generic GET Hook
export function useApiGet<T>(
  queryKey: any[],
  url: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(url, { params, timeout: 5000 });
      return res.data.data || res.data;
    },
    ...options,
  });
}

// Generic POST Hook
export function useApiPost<TData = any, TVariables = any>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const res = await axios.post(url, variables, { timeout: 5000 });
      return res.data.data || res.data;
    },
    ...options,
  });
}

// Generic PUT Hook
export function useApiPut<TData = any, TVariables = any>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const res = await axios.put(url, variables, { timeout: 5000 });
      return res.data.data || res.data;
    },
    ...options,
  });
}

// Generic PATCH Hook
export function useApiPatch<TData = any, TVariables = any>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const res = await axios.patch(url, variables, { timeout: 5000 });
      return res.data.data || res.data;
    },
    ...options,
  });
}

// Generic DELETE Hook
export function useApiDelete<TData = any, TVariables = any>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const res = await axios.delete(url, { timeout: 5000 });
      return res.data.data || res.data;
    },
    ...options,
  });
}
