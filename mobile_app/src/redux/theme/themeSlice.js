import { createSlice } from '@reduxjs/toolkit';
import { getItem, setItem } from '../../../utils/MMKVStorage';


const THEME_MODE_KEY = 'theme_mode';

const getInitialThemeMode = () => {
  const storedTheme = getItem(THEME_MODE_KEY);
  if (storedTheme) {
    // Clean up string just in case it was stored with quotes
    return storedTheme.replace(/"/g, '');
  }
  return 'light';
};

const initialState = {
  themeMode: getInitialThemeMode(), // 'light', 'dark', or 'system'
  systemTheme: 'light', // Will be updated from device settings
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      setItem(THEME_MODE_KEY, action.payload);
    },
    setSystemTheme: (state, action) => {
      state.systemTheme = action.payload;
    },
  },
});

export const { setThemeMode, setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;

