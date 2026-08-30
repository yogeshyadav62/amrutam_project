import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/redux/hooks';
import { TAB_ROUTES } from '@/navigation/BottomTab';
import { Stethoscope, ShoppingBag, FileText, User } from 'lucide-react-native';

export default function TabsLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const theme = {
    bg: isDark ? '#0F172A' : '#FFFFFF',
    border: isDark ? '#1E293B' : '#E2E8F0',
    active: '#10B981', // Unified Emerald Ayurvedic Green Theme
    inactive: isDark ? '#64748B' : '#94A3B8',
  };

  const bottomPadding = Math.max(insets.bottom, 12);
  const tabHeight = 64 + (insets.bottom > 0 ? insets.bottom - 4 : 0);

  const getIcon = (name: string, color: string, size: number) => {
    switch (name) {
      case 'index':
        return <Stethoscope size={size || 22} color={color} />;
      case 'shop':
        return <ShoppingBag size={size || 22} color={color} />;
      case 'health-records':
        return <FileText size={size || 22} color={color} />;
      case 'profile':
        return <User size={size || 22} color={color} />;
      default:
        return <Stethoscope size={size || 22} color={color} />;
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}>
      {TAB_ROUTES.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, size }) => getIcon(tab.name, color as string, size),
          }}
        />
      ))}
    </Tabs>
  );
}
