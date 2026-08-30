import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found', headerShown: false }} />
      <View className="flex-1 justify-center items-center px-6 bg-[#F9FBF8] dark:bg-[#0F172A]">
        <View className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 justify-center items-center mb-4">
          <AlertCircle size={40} className="text-emerald-600 dark:text-emerald-400" />
        </View>
        <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
          Screen Not Found
        </Text>
        <Text className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-6 text-center">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity className="px-6 py-3.5 bg-[#3A643B] rounded-full flex-row items-center gap-2">
            <ArrowLeft size={18} color="#FFFFFF" />
            <Text className="text-white text-sm font-extrabold">Back to Amrutam Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}
