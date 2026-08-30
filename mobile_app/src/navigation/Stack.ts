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

const safePush = (route: string) => {
  try {
    if (router && typeof router.push === 'function') {
      router.push(route as any);
    }
  } catch (err) {
    console.warn('Navigation push error:', err);
  }
};

const safeBack = () => {
  try {
    if (router && typeof router.back === 'function') {
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        safePush(ROUTES.HOME);
      }
    }
  } catch (err) {
    console.warn('Navigation back error:', err);
  }
};

export const navigateTo = {
  home: () => safePush(ROUTES.HOME),
  onboarding: () => safePush(ROUTES.ONBOARDING),
  consultation: () => safePush(ROUTES.CONSULTATION),
  shop: () => safePush(ROUTES.SHOP),
  healthRecords: () => safePush(ROUTES.RECORDS),
  profile: () => safePush(ROUTES.PROFILE),
  doctorDetails: (id: string) => safePush(ROUTES.DOCTOR_DETAILS(id)),
  productDetails: (id: string) => safePush(ROUTES.PRODUCT_DETAILS(id)),
  cart: () => safePush(ROUTES.CART),
  bookingSuccess: () => safePush(ROUTES.BOOKING_SUCCESS),
  goBack: () => safeBack(),
};

// React Component Hook for 100% Navigation Context Safety
export function useAppRouter() {
  const routerInstance = useRouter();

  return {
    home: () => routerInstance.push(ROUTES.HOME as any),
    onboarding: () => routerInstance.push(ROUTES.ONBOARDING as any),
    consultation: () => routerInstance.push(ROUTES.CONSULTATION as any),
    shop: () => routerInstance.push(ROUTES.SHOP as any),
    healthRecords: () => routerInstance.push(ROUTES.RECORDS as any),
    profile: () => routerInstance.push(ROUTES.PROFILE as any),
    doctorDetails: (id: string) => routerInstance.push(ROUTES.DOCTOR_DETAILS(id) as any),
    productDetails: (id: string) => routerInstance.push(ROUTES.PRODUCT_DETAILS(id) as any),
    cart: () => routerInstance.push(ROUTES.CART as any),
    bookingSuccess: () => routerInstance.push(ROUTES.BOOKING_SUCCESS as any),
    goBack: () => (routerInstance.canGoBack() ? routerInstance.back() : routerInstance.push(ROUTES.HOME as any)),
  };
}
