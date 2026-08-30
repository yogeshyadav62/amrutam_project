import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Storage } from '@/services/storageService';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  isDark: boolean;
}

const STORAGE_KEY_THEME = 'amrutam_theme_mode';
const savedTheme = Storage.getItem<ThemeMode>(STORAGE_KEY_THEME, 'light') || 'light';

const initialState: ThemeState = {
  themeMode: savedTheme,
  isDark: savedTheme === 'dark',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      state.isDark = action.payload === 'dark';
      Storage.setItem(STORAGE_KEY_THEME, action.payload);
    },
    toggleTheme: (state) => {
      const nextMode: ThemeMode = state.themeMode === 'dark' ? 'light' : 'dark';
      state.themeMode = nextMode;
      state.isDark = nextMode === 'dark';
      Storage.setItem(STORAGE_KEY_THEME, nextMode);
    },
  },
});

export const { setThemeMode, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
