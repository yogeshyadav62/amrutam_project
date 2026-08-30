import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import { ToastProvider } from '@/components/common/Toast';
import { NetworkBanner } from '@/components/common/NetworkBanner';
import { requestNotificationPermissions, triggerLocalNotification } from '@/services/notificationService';
import { BASE_URL } from '@/utils/APIRoutes';
import { io } from 'socket.io-client';
import { LogBox } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import '@/services/localization';

// Configure Reanimated logger: disable strict mode warnings during component render
try {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });
} catch (e) {
  // Graceful fallback if method signature varies
}

LogBox.ignoreLogs([
  '[Reanimated] Reading from `value` during component render',
  '[Reanimated] Writing to `value` during component render',
  'Reading from `value` during component render',
  'Writing to `value` during component render',
]);

// Automatically hide native splash screen immediately on app launch
SplashScreen.hideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  useEffect(() => {
    // Request push notification permissions on app start
    try {
      requestNotificationPermissions();
    } catch (e) {
      console.warn('Error requesting permissions:', e);
    }

    // Listen for live push notifications from backend via WebSockets
    try {
      const socketHost = BASE_URL.replace('/api', '');
      const socket = io(socketHost, { timeout: 4000 });

      socket.on('push_notification', (data: { title?: string; message?: string }) => {
        if (data?.title && data?.message) {
          triggerLocalNotification(data.title, data.message);
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.warn('Socket notification listener warning:', e);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <NetworkBanner />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#0F172A' : '#F8FAFC',
                },
              }}>
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="doctor/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="+not-found" options={{ animation: 'fade' }} />
            </Stack>
          </ToastProvider>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
