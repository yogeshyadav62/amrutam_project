import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@/redux/hooks';

export function ProductCardSkeleton() {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const bgClass = isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-200/70 border-slate-200';
  const pulseColor = isDark ? 'bg-slate-700' : 'bg-slate-300';

  return (
    <Animated.View
      style={{ opacity }}
      className={`w-[48%] p-3 rounded-3xl mb-4 border ${bgClass}`}>
      <View className={`w-full h-32 rounded-2xl mb-3 ${pulseColor}`} />
      
      <View className={`h-3 w-1/3 rounded-md mb-2 ${pulseColor}`} />
      <View className={`h-4 w-4/5 rounded-md mb-1.5 ${pulseColor}`} />
      <View className={`h-3 w-3/5 rounded-md mb-3 ${pulseColor}`} />

      <View className="flex-row justify-between items-center pt-1">
        <View className={`h-5 w-14 rounded-md ${pulseColor}`} />
        <View className={`h-8 w-8 rounded-full ${pulseColor}`} />
      </View>
    </Animated.View>
  );
}
