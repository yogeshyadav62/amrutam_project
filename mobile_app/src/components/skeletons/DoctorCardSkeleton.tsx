import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@/redux/hooks';

export function DoctorCardSkeleton() {
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
    <View className={`p-4 rounded-2xl mb-3.5 border ${bgClass}`}>
      <Animated.View style={{ opacity }}>
        <View className="flex-row gap-3.5">
          <View className={`w-14 h-14 rounded-full ${pulseColor}`} />

          <View className="flex-1 justify-center gap-2">
            <View className={`h-4 w-3/4 rounded-md ${pulseColor}`} />
            <View className={`h-3 w-1/2 rounded-md ${pulseColor}`} />
            <View className={`h-3 w-2/5 rounded-md ${pulseColor}`} />
          </View>
        </View>

        <View className="flex-row gap-4 mt-4">
          <View className={`h-3 w-16 rounded-md ${pulseColor}`} />
          <View className={`h-3 w-20 rounded-md ${pulseColor}`} />
        </View>

        <View className={`h-px my-3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <View className="flex-row justify-between items-center">
          <View className="gap-1">
            <View className={`h-2.5 w-16 rounded-md ${pulseColor}`} />
            <View className={`h-5 w-12 rounded-md ${pulseColor}`} />
          </View>

          <View className={`h-10 w-28 rounded-xl ${pulseColor}`} />
        </View>
      </Animated.View>
    </View>
  );
}
