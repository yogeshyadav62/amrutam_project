import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getHost(): string {
  if (Platform.OS === 'web') return 'localhost';

  // 1. Try to extract IP from Metro debuggerHost (works dynamically on Expo Go / Development Builds)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri && typeof hostUri === 'string') {
    const extractedIp = hostUri.split(':')[0];
    if (extractedIp && extractedIp !== 'localhost' && extractedIp !== '127.0.0.1') {
      return extractedIp;
    }
  }

  // 2. Localhost fallback (routed via ADB reverse tcp:5000 tcp:5000 or emulator)
  return 'localhost';
}

export const RENDER_BACKEND_URL = 'https://amrutam-project.onrender.com/api';
export const IP_ADDRESS = getHost();
export const BASE_URL = RENDER_BACKEND_URL;

export const API_ROUTES = {
  BASE_URL,
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  ME: `${BASE_URL}/auth/me`,
  DOCTORS: `${BASE_URL}/doctors`,
  DOCTOR_BY_ID: (id: string) => `${BASE_URL}/doctors/${id}`,
  DOCTOR_SLOTS: (id: string) => `${BASE_URL}/doctors/${id}/slots`,
  DOCTOR_BOOKINGS: (id: string) => `${BASE_URL}/doctors/${id}/bookings`,
  BOOKINGS: `${BASE_URL}/bookings`,
  CANCEL_BOOKING: (id: string) => `${BASE_URL}/bookings/${id}/cancel`,
  PRODUCTS: `${BASE_URL}/products`,
  PRODUCT_BY_ID: (id: string) => `${BASE_URL}/products/${id}`,
  HEALTH_RECORDS: `${BASE_URL}/health-records`,
  SYNC: `${BASE_URL}/sync`,
  STATS: `${BASE_URL}/stats`,
} as const;
