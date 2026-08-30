import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Booking } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { Storage } from '@/services/storageService';

const getStorageKey = (userId?: string) =>
  userId ? `amrutam_user_bookings_${userId}` : 'amrutam_user_bookings_guest';

interface BookingState {
  bookings: Booking[];
  offlineQueue: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  offlineQueue: [],
  isLoading: false,
  error: null,
};

export const fetchBookingsThunk = createAsyncThunk(
  'booking/fetchBookings',
  async (userId?: string) => {
    if (!userId) return [];
    try {
      const res = await axios.get(API_ROUTES.BOOKINGS, {
        params: { patientId: userId },
        timeout: 4000,
      });
      const raw = res.data?.data;
      const list: Booking[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      
      const filtered = list.filter((b) => b.patientId === userId);
      Storage.setItem(getStorageKey(userId), filtered);
      return filtered;
    } catch {
      return Storage.getItem<Booking[]>(getStorageKey(userId), []) || [];
    }
  }
);

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<{ userId?: string; bookings: Booking[] }>) => {
      const { userId, bookings } = action.payload;
      const map = new Map<string, Booking>();

      // Preserve existing local bookings first so newly booked slots are NEVER wiped
      state.bookings.forEach((b) => {
        if (b && (b.id || (b as any)._id)) {
          const key = String(b.id || (b as any)._id);
          map.set(key, b);
        }
      });

      // Merge incoming API bookings
      (bookings || []).forEach((b) => {
        if (b && (b.id || (b as any)._id)) {
          const key = String(b.id || (b as any)._id);
          map.set(key, b);
        }
      });

      const merged = Array.from(map.values());
      const filtered = userId
        ? merged.filter(
            (b) =>
              String(b.patientId) === String(userId) ||
              (userId === 'usr_guest' && b.patientId === 'usr_guest')
          )
        : merged;

      state.bookings = filtered;
      if (userId) {
        Storage.setItem(getStorageKey(userId), filtered);
      }
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      const newBooking = action.payload;
      const existing = state.bookings.filter((b) => b.id !== newBooking.id);
      state.bookings = [newBooking, ...existing];
      if (newBooking.patientId) {
        Storage.setItem(getStorageKey(newBooking.patientId), state.bookings);
      }
    },
    addOfflineBooking: (state, action: PayloadAction<Booking>) => {
      const newBooking = action.payload;
      state.offlineQueue.push(newBooking);
      const existing = state.bookings.filter((b) => b.id !== newBooking.id);
      state.bookings = [newBooking, ...existing];
      if (newBooking.patientId) {
        Storage.setItem(getStorageKey(newBooking.patientId), state.bookings);
      }
      Storage.setItem('amrutam_offline_booking_queue', state.offlineQueue);
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: Booking['status'] }>) => {
      const b = state.bookings.find((item) => item.id === action.payload.id);
      if (b) {
        b.status = action.payload.status;
        Storage.setItem(getStorageKey(b.patientId), state.bookings);
      }
    },
    resetBookings: (state) => {
      state.bookings = [];
      state.offlineQueue = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingsThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const currentUserId = action.meta.arg;
        const userBookings = (action.payload || []).filter((b) => b && String(b.patientId) === String(currentUserId));
        state.bookings = userBookings;
        if (currentUserId) {
          Storage.setItem(getStorageKey(currentUserId), userBookings);
        }
      })
      .addCase(fetchBookingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      });
  },
});

export const {
  setBookings,
  addBooking,
  addOfflineBooking,
  updateBookingStatus,
  resetBookings,
} = bookingSlice.actions;

export default bookingSlice.reducer;
