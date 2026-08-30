import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { toggleTheme, setThemeMode } from './slices/themeSlice';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useTheme() {
  const dispatch = useAppDispatch();
  const { themeMode, isDark } = useAppSelector((state) => state.theme);

  return {
    themeMode,
    isDark,
    toggleTheme: () => dispatch(toggleTheme()),
    setThemeMode: (mode: 'light' | 'dark') => dispatch(setThemeMode(mode)),
  };
}
