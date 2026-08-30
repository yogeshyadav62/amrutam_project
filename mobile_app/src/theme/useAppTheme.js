import { useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setSystemTheme } from '../Redux/Slices/theme/themeSlice';

export default function useAppTheme() {
  const dispatch = useDispatch();
  const systemTheme = useColorScheme();
  const themeState = useSelector((state) => state.theme);

  // Sync system theme with Redux
  useEffect(() => {
    if (systemTheme) {
      dispatch(setSystemTheme(systemTheme));
    }
  }, [systemTheme, dispatch]);

  // Handle case when theme slice doesn't exist
  if (!themeState) {
    return systemTheme || 'light';
  }

  const { themeMode, systemTheme: storedSystemTheme } = themeState;

  return themeMode === 'system' ? (systemTheme || storedSystemTheme || 'light') : (themeMode || 'light');
}
