export const NAV_ROUTES = {
  DASHBOARD: 'dashboard',
  DOCTORS: 'doctors',
  PRODUCTS: 'products',
  BOOKINGS: 'bookings',
  RECORDS: 'records',
  NOTIFICATIONS: 'notifications',
} as const;

export const BASE_URL = 'http://localhost:5000/api';

export const API_ROUTES = {
  BASE_URL,
  DOCTORS: `${BASE_URL}/doctors`,
  DOCTOR_BY_ID: (id: string) => `${BASE_URL}/doctors/${id}`,
  DOCTOR_SLOTS: (id: string) => `${BASE_URL}/doctors/${id}/slots`,
  DOCTOR_BOOKINGS: (id: string) => `${BASE_URL}/doctors/${id}/bookings`,
  PRODUCTS: `${BASE_URL}/products`,
  PRODUCT_BY_ID: (id: string) => `${BASE_URL}/products/${id}`,
  BOOKINGS: `${BASE_URL}/bookings`,
  CANCEL_BOOKING: (id: string) => `${BASE_URL}/bookings/${id}/cancel`,
  UPDATE_BOOKING_STATUS: (id: string) => `${BASE_URL}/bookings/${id}/status`,
  HEALTH_RECORDS: `${BASE_URL}/health-records`,
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  SYNC: `${BASE_URL}/sync`,
  STATS: `${BASE_URL}/stats`,
} as const;

export const ROUTES = NAV_ROUTES;
