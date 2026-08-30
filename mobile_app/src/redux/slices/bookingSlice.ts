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
      const userBookings = userId
        ? bookings.filter((b) => b.patientId === userId)
        : bookings;
      state.bookings = userBookings;
      Storage.setItem(getStorageKey(userId), userBookings);
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      const newBooking = action.payload;
      const existing = state.bookings.filter((b) => b.id !== newBooking.id);
      state.bookings = [newBooking, ...existing];
      Storage.setItem(getStorageKey(newBooking.patientId), state.bookings);
    },
    addOfflineBooking: (state, action: PayloadAction<Booking>) => {
      const newBooking = action.payload;
      state.offlineQueue.push(newBooking);
      const existing = state.bookings.filter((b) => b.id !== newBooking.id);
      state.bookings = [newBooking, ...existing];
      Storage.setItem(`amrutam_offline_queue_${newBooking.patientId}`, state.offlineQueue);
      Storage.setItem(getStorageKey(newBooking.patientId), state.bookings);
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
        const apiBookings = action.payload || [];
        const map = new Map<string, Booking>();
        // Preserve existing local bookings first
        state.bookings.forEach((b) => {
          if (b && b.id) map.set(b.id, b);
        });
        // Merge API bookings
        apiBookings.forEach((b) => {
          if (b && b.id) map.set(b.id, b);
        });
        const merged = Array.from(map.values());
        state.bookings = merged;
        if (action.meta.arg) {
          Storage.setItem(getStorageKey(action.meta.arg), merged);
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
