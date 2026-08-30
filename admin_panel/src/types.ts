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
  slotId: string;
  slotTime: string;
  slotDate: string;
  createdAt?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
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
