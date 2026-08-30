import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAppSelector } from '@/redux/hooks';
import { TAB_ROUTES } from '@/navigation/BottomTab';
import { Stethoscope, ShoppingBag, FileText, User } from 'lucide-react-native';

import { CartItem } from '@/utils/APiCalls';

export default function TabsLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const cart = useAppSelector((state) => state.cart.cart);
  const totalCartCount = (cart || []).reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

  const theme = {
    bg: isDark ? '#0F172A' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    active: '#3A643B', // Signature Amrutam Deep Forest Green
    inactive: isDark ? '#64748B' : '#94A3B8',
  };

  const bottomPadding = Math.max(insets.bottom, 12);
  const tabHeight = 64 + (insets.bottom > 0 ? insets.bottom - 4 : 0);

  const getIcon = (name: string, color: string, focused: boolean) => {
    const size = 22;
    let iconElement: React.ReactNode = null;

    switch (name) {
      case 'index':
        iconElement = <Stethoscope size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
        break;
      case 'shop':
        iconElement = (
          <View>
            <ShoppingBag size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
            {totalCartCount > 0 && (
              <View className="absolute -top-1.5 -right-2 bg-red-500 rounded-full min-w-[16px] h-4 px-1 justify-center items-center">
                <Text className="text-white text-[9px] font-black">{totalCartCount > 99 ? '99+' : totalCartCount}</Text>
              </View>
            )}
          </View>
        );
        break;
      case 'health-records':
        iconElement = <FileText size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
        break;
      case 'profile':
        iconElement = <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
        break;
      default:
        iconElement = <Stethoscope size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
    }

    return (
      <View className={`items-center justify-center py-1 px-3.5 rounded-full ${focused ? (isDark ? 'bg-emerald-950/60' : 'bg-[#EAF2E8]') : ''}`}>
        {iconElement}
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false, // Pre-render tab screens for instant 0ms tab switching
        freezeOnBlur: true, // Prevent inactive background tab re-renders
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 4,
          letterSpacing: 0.2,
        },
      }}>
      {TAB_ROUTES.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, focused }) => getIcon(tab.name, color as string, focused),
          }}
        />
      ))}
    </Tabs>
  );
}
