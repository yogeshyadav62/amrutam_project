import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getHost(): string {
  if (Platform.OS === 'web') return 'localhost';

  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri && typeof hostUri === 'string') {
    const extractedIp = hostUri.split(':')[0];
    if (extractedIp && extractedIp !== 'localhost' && extractedIp !== '127.0.0.1') {
      return extractedIp;
    }
  }

  return '192.168.31.44';
}

export const IP_ADDRESS = getHost();
export const BASE_URL = `http://${IP_ADDRESS}:5000/api`;

export const API_ROUTES = {
  BASE_URL,
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
