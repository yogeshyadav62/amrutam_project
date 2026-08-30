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
    try { router.push(ROUTES.HOME as any); } catch (e) {}
  },
  onboarding: () => {
    try { router.push(ROUTES.ONBOARDING as any); } catch (e) {}
  },
  consultation: () => {
    try { router.push(ROUTES.CONSULTATION as any); } catch (e) {}
  },
  shop: () => {
    try { router.push(ROUTES.SHOP as any); } catch (e) {}
  },
  healthRecords: () => {
    try { router.push(ROUTES.RECORDS as any); } catch (e) {}
  },
  profile: () => {
    try { router.push(ROUTES.PROFILE as any); } catch (e) {}
  },
  doctorDetails: (id: string) => {
    try { router.push(ROUTES.DOCTOR_DETAILS(id) as any); } catch (e) {}
  },
  productDetails: (id: string) => {
    try { router.push(ROUTES.PRODUCT_DETAILS(id) as any); } catch (e) {}
  },
  cart: () => {
    try { router.push(ROUTES.CART as any); } catch (e) {}
  },
  bookingSuccess: () => {
    try { router.push(ROUTES.BOOKING_SUCCESS as any); } catch (e) {}
  },
  goBack: () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push(ROUTES.HOME as any);
      }
    } catch (e) {}
  },
};

// Safe Hook wrapper around router navigation
export function useAppRouter() {
  return navigateTo;
}
