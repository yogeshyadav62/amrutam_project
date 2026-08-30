import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Booking } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { Storage } from '@/services/storageService';

const STORAGE_KEY_BOOKINGS = 'amrutam_user_bookings';
const STORAGE_KEY_OFFLINE_QUEUE = 'amrutam_offline_booking_queue';

interface BookingState {
  bookings: Booking[];
  offlineQueue: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: Storage.getItem<Booking[]>(STORAGE_KEY_BOOKINGS, []) || [],
  offlineQueue: Storage.getItem<Booking[]>(STORAGE_KEY_OFFLINE_QUEUE, []) || [],
  isLoading: false,
  error: null,
};

export const fetchBookingsThunk = createAsyncThunk('booking/fetchBookings', async () => {
  try {
    const res = await axios.get(API_ROUTES.BOOKINGS, { timeout: 4000 });
    return res.data.data as Booking[];
  } catch {
    return Storage.getItem<Booking[]>(STORAGE_KEY_BOOKINGS, []) || [];
  }
});

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
      Storage.setItem(STORAGE_KEY_BOOKINGS, action.payload);
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
      Storage.setItem(STORAGE_KEY_BOOKINGS, state.bookings);
    },
    addOfflineBooking: (state, action: PayloadAction<Booking>) => {
      state.offlineQueue.push(action.payload);
      state.bookings.unshift(action.payload);
      Storage.setItem(STORAGE_KEY_OFFLINE_QUEUE, state.offlineQueue);
      Storage.setItem(STORAGE_KEY_BOOKINGS, state.bookings);
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: Booking['status'] }>) => {
      const b = state.bookings.find((item) => item.id === action.payload.id);
      if (b) b.status = action.payload.status;
      Storage.setItem(STORAGE_KEY_BOOKINGS, state.bookings);
    },
    clearOfflineQueue: (state) => {
      state.offlineQueue = [];
      Storage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingsThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
        Storage.setItem(STORAGE_KEY_BOOKINGS, action.payload);
      })
      .addCase(fetchBookingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      });
  },
});

export const { setBookings, addBooking, addOfflineBooking, updateBookingStatus, clearOfflineQueue } = bookingSlice.actions;
export default bookingSlice.reducer;
