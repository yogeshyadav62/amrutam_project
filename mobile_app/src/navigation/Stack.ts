import { Stack, router, useRouter } from 'expo-router';

export const NAV_ROUTES = {
  HOME: '/',
  ONBOARDING: '/onboarding',
  CONSULTATION: '/(tabs)',
  SHOP: '/(tabs)/shop',
  RECORDS: '/(tabs)/health-records',
  PROFILE: '/(tabs)/profile',
  CART: '/cart',
  BOOKING_SUCCESS: '/booking-success',
  DOCTOR_DETAILS: (id: string) => `/doctor/${id}`,
  PRODUCT_DETAILS: (id: string) => `/product/${id}`,
} as const;

export const ROUTES = NAV_ROUTES;

export { Stack, router, useRouter };

export const navigateTo = {
  home: () => {
    try { router.push(ROUTES.HOME as any); } catch {}
  },
  onboarding: () => {
    try { router.push(ROUTES.ONBOARDING as any); } catch {}
  },
  consultation: () => {
    try { router.push(ROUTES.CONSULTATION as any); } catch {}
  },
  shop: () => {
    try { router.push(ROUTES.SHOP as any); } catch {}
  },
  healthRecords: () => {
    try { router.push(ROUTES.RECORDS as any); } catch {}
  },
  profile: () => {
    try { router.push(ROUTES.PROFILE as any); } catch {}
  },
  doctorDetails: (id: string) => {
    try { router.push(ROUTES.DOCTOR_DETAILS(id) as any); } catch {}
  },
  productDetails: (id: string) => {
    try { router.push(ROUTES.PRODUCT_DETAILS(id) as any); } catch {}
  },
  cart: () => {
    try { router.push(ROUTES.CART as any); } catch {}
  },
  bookingSuccess: () => {
    try { router.push(ROUTES.BOOKING_SUCCESS as any); } catch {}
  },
  goBack: () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push(ROUTES.HOME as any);
      }
    } catch {
      try {
        router.push(ROUTES.HOME as any);
      } catch (err) {
        console.warn('Navigation error:', err);
      }
    }
  },
};

// Safe Hook that returns static singleton navigation to prevent 'Couldn't find a navigation context' crash
export function useAppRouter() {
  return navigateTo;
}
