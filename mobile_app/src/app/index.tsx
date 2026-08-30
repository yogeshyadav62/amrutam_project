import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { Storage } from '@/services/storageService';

export default function IndexScreen() {
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = Storage.getItem<boolean>('hasCompletedOnboarding', false);
    setHasCompleted(completed ?? false);
  }, []);

  if (hasCompleted === null) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FBF8]">
        <ActivityIndicator size="large" color="#3A643B" />
      </View>
    );
  }

  if (!hasCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
