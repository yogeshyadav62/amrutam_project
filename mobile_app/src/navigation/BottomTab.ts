export type BottomTabParamList = {
  index: undefined;
  shop: undefined;
  'health-records': undefined;
  profile: undefined;
};

export const TAB_ROUTES = [
  {
    name: 'index',
    label: 'Consultation',
    icon: 'Stethoscope',
  },
  {
    name: 'shop',
    label: 'Shop',
    icon: 'ShoppingBag',
  },
  {
    name: 'health-records',
    label: 'Health Records',
    icon: 'FileText',
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: 'User',
  },
] as const;
