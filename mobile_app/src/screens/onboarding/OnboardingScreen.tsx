import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppRouter } from '@/navigation/Stack';
import { Storage } from '@/services/storageService';
import { Stethoscope, ShoppingBag, FolderPlus, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useAppRouter();
  const [activeStep, setActiveStep] = useState(0);

  const handleComplete = () => {
    Storage.setItem('hasCompletedOnboarding', true);
    router.consultation();
  };

  return (
    <View
      className="flex-1 bg-[#F9FBF8]"
      style={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 20),
      }}>
      {/* Top Skip Button */}
      <View className="flex-row justify-end px-6 py-2">
        <TouchableOpacity onPress={handleComplete} activeOpacity={0.7} className="py-1 px-3">
          <Text className="text-[#3A643B] text-base font-extrabold tracking-wide">Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}>
        {/* Branding & Logo Section */}
        <View className="items-center mt-2">
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 140, height: 110 }}
            resizeMode="contain"
          />
          <Text className="text-[#2D5A27] text-3xl font-black tracking-widest mt-2">AMRUTAM</Text>
          <Text className="text-[#4E7B4C] text-[10px] font-bold tracking-[3px] uppercase mt-1">
            HEALTH | HEALING | HAPPINESS
          </Text>
        </View>

        {/* Headline & Subtitle */}
        <View className="items-center my-6">
          <Text className="text-[#1A3817] text-2xl font-black text-center leading-8 px-2">
            Your Complete{' \n'}
            <Text className="text-[#3A643B]">Ayurveda & Wellness</Text>{' \n'}
            Companion
          </Text>

          <View className="flex-row items-center gap-1.5 my-3">
            <View className="w-8 h-[1px] bg-[#3A643B]/30" />
            <Text className="text-xs">🌿</Text>
            <View className="w-8 h-[1px] bg-[#3A643B]/30" />
          </View>

          <Text className="text-[#4A5D48] text-xs text-center leading-5 px-4 font-semibold">
            Consult with expert doctors, explore authentic Ayurvedic products and manage your health records – all in one place.
          </Text>
        </View>

        {/* 3 Core Feature Highlights Grid */}
        <View className="flex-row justify-between items-start my-4 px-1">
          {/* Consultation */}
          <View className="items-center flex-1">
            <View className="w-16 h-16 rounded-full bg-[#EAF2E8] justify-center items-center mb-2 border border-[#CDE0CB]">
              <Stethoscope size={26} color="#3A643B" />
            </View>
            <Text className="text-[#2D5A27] text-xs font-black text-center">Consultation</Text>
            <Text className="text-[#64748B] text-[10px] text-center mt-1 leading-3 font-semibold px-1">
              Expert Ayurvedic Doctors
            </Text>
          </View>

          <View className="w-[1px] h-12 bg-[#E2E8F0] self-center my-auto" />

          {/* Shop */}
          <View className="items-center flex-1">
            <View className="w-16 h-16 rounded-full bg-[#EAF2E8] justify-center items-center mb-2 border border-[#CDE0CB]">
              <ShoppingBag size={26} color="#3A643B" />
            </View>
            <Text className="text-[#2D5A27] text-xs font-black text-center">Shop</Text>
            <Text className="text-[#64748B] text-[10px] text-center mt-1 leading-3 font-semibold px-1">
              Pure Ayurvedic Essentials
            </Text>
          </View>

          <View className="w-[1px] h-12 bg-[#E2E8F0] self-center my-auto" />

          {/* Health Records */}
          <View className="items-center flex-1">
            <View className="w-16 h-16 rounded-full bg-[#EAF2E8] justify-center items-center mb-2 border border-[#CDE0CB]">
              <FolderPlus size={26} color="#3A643B" />
            </View>
            <Text className="text-[#2D5A27] text-xs font-black text-center">Health Records</Text>
            <Text className="text-[#64748B] text-[10px] text-center mt-1 leading-3 font-semibold px-1">
              Organized & Secure Health Data
            </Text>
          </View>
        </View>

        {/* Bottom Pagination & Get Started Action */}
        <View className="items-center mt-4">
          {/* Pagination Dots */}
          <View className="flex-row items-center gap-2 mb-6">
            <View className="w-2.5 h-2.5 rounded-full bg-[#3A643B]" />
            <View className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
            <View className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            className="w-full bg-[#3A643B] py-4 rounded-full flex-row justify-center items-center gap-2.5 shadow-md active:opacity-90"
            onPress={handleComplete}
            activeOpacity={0.85}>
            <Text className="text-white text-base font-extrabold tracking-wide">Get Started</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
