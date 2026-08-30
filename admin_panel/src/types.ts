export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'doctor';
  specialty?: string;
  degree?: string;
  hospital?: string;
  consultationFee?: number;
  availableSlots?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  email?: string;
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

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  size?: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount?: number;
  stockQuantity?: number;
  shortDescription: string;
  fullDescription: string;
  badge?: string;
  badgeText?: string;
  benefits?: string[];
  ingredients?: string[];
  dosage?: string;
  isBestseller?: boolean;
  imageUrl?: string;
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
  notes?: string;
  createdAt?: string;
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';
  isOfflineQueued?: boolean;
}

export interface HealthRecord {
  id: string;
  title: string;
  doctorName: string;
  facility?: string;
  date: string;
  type: string;
  summary: string;
  tags: string[];
  hasAttachment?: boolean;
  attachmentUrl?: string;
  fileType?: string;
  fileSize?: string;
}

export interface PaginatedData<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}
