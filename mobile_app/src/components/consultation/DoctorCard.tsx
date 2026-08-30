import React, { memo, useCallback } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Doctor } from '@/utils/APiCalls';
import { useAppRouter } from '@/navigation/Stack';
import { useTheme } from '@/redux/hooks';
import { Star, Clock, Calendar, ChevronRight, User } from 'lucide-react-native';

interface Props {
  doctor: Doctor;
}

export const DoctorCard = memo<Props>(({ doctor }) => {
  const { isDark } = useTheme();
  const router = useAppRouter();

  const handlePress = useCallback(() => {
    router.doctorDetails(doctor.id);
  }, [doctor.id, router]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      className={`p-4 rounded-2xl mb-3.5 border ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
      <View className="flex-row gap-3.5">
        <View className="w-14 h-14 rounded-full bg-emerald-500/10 items-center justify-center">
          <User size={28} color="#10B981" />
        </View>

        <View className="flex-1 justify-center">
          <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {doctor.name}
          </Text>
          <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {doctor.degree}
          </Text>
          <Text className="text-xs font-bold text-emerald-600 mt-1">
            {doctor.specialty}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4 mt-3 pt-2">
        <View className="flex-row items-center gap-1">
          <Star size={13} color="#F59E0B" fill="#F59E0B" />
          <Text className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {doctor.rating} ({doctor.reviewCount})
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Clock size={13} color="#64748B" />
          <Text className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {doctor.experienceYears} Yrs Exp
          </Text>
        </View>
      </View>

      <View className={`h-px my-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />

      <View className="flex-row justify-between items-center">
        <View>
          <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Consultation Fee
          </Text>
          <Text className={`text-lg font-extrabold mt-0.5 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            ₹{doctor.consultationFee}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-emerald-600 px-4 py-2.5 rounded-xl flex-row items-center gap-1.5"
          activeOpacity={0.8}
          onPress={handlePress}>
          <Calendar size={14} color="#FFFFFF" />
          <Text className="text-white text-xs font-bold">Book Slot</Text>
          <ChevronRight size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

DoctorCard.displayName = 'DoctorCard';
