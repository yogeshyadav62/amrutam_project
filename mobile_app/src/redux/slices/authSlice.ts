import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Storage } from '@/services/storageService';

const AUTH_KEY = 'amrutam_auth_session';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

// MMKV se saved session restore karo
function loadSessionFromStorage(): AuthState {
  try {
    const saved = Storage.getItem<{ user: UserProfile; token?: string }>(AUTH_KEY);
    if (saved && saved.user && (saved.user.id || saved.user.name)) {
      const token = saved.token || `amrutam_token_${saved.user.id || 'usr'}`;
      return {
        user: saved.user,
        token: token,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.warn('Error loading session from storage:', e);
  }
  return { user: null, token: null, isAuthenticated: false };
}

const initialState: AuthState = loadSessionFromStorage();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: UserProfile; token?: string }>) => {
      const token = action.payload.token || `amrutam_token_${action.payload.user.id || Date.now()}`;
      state.user = action.payload.user;
      state.token = token;
      state.isAuthenticated = true;
      // MMKV me permanent save
      Storage.setItem(AUTH_KEY, { user: action.payload.user, token });
    },
    logout: (state) => {
      const userId = state.user?.id;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // MMKV se session aur us user ka sabhi local data clear
      Storage.removeItem(AUTH_KEY);
      if (userId) {
        Storage.removeItem(`amrutam_user_bookings_${userId}`);
        Storage.removeItem(`amrutam_offline_queue_${userId}`);
      }
      Storage.removeItem('amrutam_user_bookings');
      Storage.removeItem('amrutam_user_bookings_guest');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
